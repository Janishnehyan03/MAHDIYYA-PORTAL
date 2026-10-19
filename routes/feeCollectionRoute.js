const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../controllers/authController");
const FeeRate = require("../models/feeRateModel");
const FeeCollection = require("../models/feeCollectionModel");
const Student = require("../models/studentModel");
const Branch = require("../models/studyCentreModel");
const Class = require("../models/classModel");

router.use(protect);

router.get("/my-status", restrictTo("admin"), async (req, res, next) => {
  try {
    const record = await FeeCollection.findOne({ studyCentre: req.user.branch })
      .populate("studyCentre", "studyCentreName studyCentreCode")
      .sort({ academicYear: -1, createdAt: -1 });
    if (!record) return res.json(null);
    const paid = record.payments.reduce((sum, payment) => sum + payment.amount, 0);
    res.json({ ...record.toObject(), paid, outstanding: Math.max(record.totalDue - paid, 0) });
  } catch (e) { next(e); }
});

router.use(restrictTo("superAdmin"));

router.get("/", async (req, res, next) => {
  try {
    const year = req.query.academicYear;
    const [rates, collections] = await Promise.all([
      FeeRate.find(year ? { academicYear: year } : {}).sort({ effectiveFrom: -1 }),
      FeeCollection.find(year ? { academicYear: year } : {}).populate("studyCentre", "studyCentreName studyCentreCode").sort({ createdAt: -1 }),
    ]);
    res.json({ rates, collections });
  } catch (e) { next(e); }
});

router.get("/centre/:centreId", async (req, res, next) => {
  try {
    const records = await FeeCollection.find({ studyCentre: req.params.centreId })
      .populate("studyCentre", "studyCentreName studyCentreCode phone email district state")
      .sort({ academicYear: -1, createdAt: -1 });
    if (!records.length) return res.status(404).json({ message: "No fee records found for this study centre" });
    const statements = records.map((record) => {
      const paid = record.payments.reduce((sum, payment) => sum + payment.amount, 0);
      return { ...record.toObject(), paid, outstanding: Math.max(record.totalDue - paid, 0) };
    });
    res.json({ studyCentre: records[0].studyCentre, statements });
  } catch (e) { next(e); }
});

router.post("/rates", async (req, res, next) => {
  try {
    const {
      academicYear,
      affiliationFeeM1M2,
      affiliationFeeDegree,
      courseFeeM1M2,
      courseFeeM3M5,
      examFeeM1M2,
      examFeeM3M5,
    } = req.body;

    const affM1M2 = Number(affiliationFeeM1M2 !== undefined && affiliationFeeM1M2 !== "" ? affiliationFeeM1M2 : 1000);
    const affDegree = Number(affiliationFeeDegree !== undefined && affiliationFeeDegree !== "" ? affiliationFeeDegree : 1500);
    const cM1M2 = Number(courseFeeM1M2 !== undefined && courseFeeM1M2 !== "" ? courseFeeM1M2 : 600);
    const cM3M5 = Number(courseFeeM3M5 !== undefined && courseFeeM3M5 !== "" ? courseFeeM3M5 : 700);
    const eM1M2 = Number(examFeeM1M2 !== undefined && examFeeM1M2 !== "" ? examFeeM1M2 : 150);
    const eM3M5 = Number(examFeeM3M5 !== undefined && examFeeM3M5 !== "" ? examFeeM3M5 : 200);

    if (!academicYear || isNaN(affM1M2) || isNaN(affDegree) || isNaN(cM1M2) || isNaN(cM3M5) || isNaN(eM1M2) || isNaN(eM3M5)) {
      return res.status(400).json({ message: "Academic year and valid fee amounts are required" });
    }

    const rate = await FeeRate.create({
      academicYear,
      affiliationFeeM1M2: affM1M2,
      affiliationFeeDegree: affDegree,
      affiliationFee: affM1M2,
      courseFeeM1M2: cM1M2,
      courseFeeM3M5: cM3M5,
      examFeeM1M2: eM1M2,
      examFeeM3M5: eM3M5,
      createdBy: req.user._id,
    });
    res.status(201).json(rate);
  } catch (e) { next(e); }
});

router.post("/calculate", async (req, res, next) => {
  try {
    const { academicYear } = req.body;
    const rate = await FeeRate.findOne({ academicYear }).sort({ effectiveFrom: -1 });
    if (!rate) return res.status(404).json({ message: "No fee rate configured for this academic year" });

    // Identify M1 & M2 vs M3 to M5 classes
    const m1m2Classes = await Class.find({
      $or: [{ courseLevel: "M1_M2" }, { classOrder: { $lte: 2 } }],
    }).select("_id");
    const m1m2ClassIds = m1m2Classes.map((c) => c._id);

    const m3m5Classes = await Class.find({
      $or: [{ courseLevel: "DEGREE" }, { classOrder: { $gte: 3 } }],
    }).select("_id");
    const m3m5ClassIds = m3m5Classes.map((c) => c._id);

    const centres = await Branch.find({ isActive: { $ne: false } });
    const AcademicYear = require("../models/academicYearModel");
    const academicYearRecord = await AcademicYear.findOne({ year: academicYear });
    const records = [];

    const affM1M2 = rate.affiliationFeeM1M2 !== undefined ? rate.affiliationFeeM1M2 : (rate.affiliationFee || 1000);
    const affDegree = rate.affiliationFeeDegree !== undefined ? rate.affiliationFeeDegree : 1500;
    const cM1M2Rate = rate.courseFeeM1M2 !== undefined ? rate.courseFeeM1M2 : 600;
    const cM3M5Rate = rate.courseFeeM3M5 !== undefined ? rate.courseFeeM3M5 : 700;
    const eM1M2Rate = rate.examFeeM1M2 !== undefined ? rate.examFeeM1M2 : 150;
    const eM3M5Rate = rate.examFeeM3M5 !== undefined ? rate.examFeeM3M5 : 200;

    for (const centre of centres) {
      const studentFilter = {
        branch: centre._id,
        completed: { $ne: true },
        droppedOut: { $ne: true },
        deleted: { $ne: true },
      };

      // Count students in M1 & M2
      const m1m2StudentCount = await Student.countDocuments({
        ...studentFilter,
        class: { $in: m1m2ClassIds },
      });

      // Count students in M3 to M5
      const m3m5StudentCount = await Student.countDocuments({
        ...studentFilter,
        class: { $in: m3m5ClassIds },
      });

      const totalStudents = m1m2StudentCount + m3m5StudentCount;
      const hasDegreeStudents = m3m5StudentCount > 0;

      const affiliationType = hasDegreeStudents ? "DEGREE" : "M1_M2";
      const affiliationFee = hasDegreeStudents ? affDegree : affM1M2;

      const courseFeeTotal = (m1m2StudentCount * cM1M2Rate) + (m3m5StudentCount * cM3M5Rate);
      const examFeeTotal = (m1m2StudentCount * eM1M2Rate) + (m3m5StudentCount * eM3M5Rate);

      const totalDue = affiliationFee + courseFeeTotal + examFeeTotal;

      const existing = await FeeCollection.findOne({ studyCentre: centre._id, academicYear });
      if (existing) {
        const paid = existing.payments.reduce((sum, p) => sum + p.amount, 0);
        existing.affiliationFee = affiliationFee;
        existing.affiliationType = affiliationType;
        existing.m1m2StudentCount = m1m2StudentCount;
        existing.m3m5StudentCount = m3m5StudentCount;
        existing.studentCount = totalStudents;
        existing.courseFeeM1M2 = cM1M2Rate;
        existing.courseFeeM3M5 = cM3M5Rate;
        existing.courseFeeTotal = courseFeeTotal;
        existing.examFeeM1M2 = eM1M2Rate;
        existing.examFeeM3M5 = eM3M5Rate;
        existing.examFeeTotal = examFeeTotal;
        existing.totalDue = totalDue;
        existing.status = paid >= totalDue ? "paid" : (paid > 0 ? "partial" : "pending");
        existing.calculatedAt = new Date();
        await existing.save();
        records.push(existing);
      } else {
        records.push(await FeeCollection.create({
          studyCentre: centre._id,
          academicYear,
          affiliationFee,
          affiliationType,
          m1m2StudentCount,
          m3m5StudentCount,
          studentCount: totalStudents,
          courseFeeM1M2: cM1M2Rate,
          courseFeeM3M5: cM3M5Rate,
          courseFeeTotal,
          examFeeM1M2: eM1M2Rate,
          examFeeM3M5: eM3M5Rate,
          examFeeTotal,
          totalDue,
        }));
      }
    }
    res.json(records);
  } catch (e) { next(e); }
});

router.post("/:id/payments", async (req, res, next) => {
  try {
    const record = await FeeCollection.findById(req.params.id);
    if (!record) return res.status(404).json({ message: "Fee record not found" });
    const amount = Number(req.body.amount);
    const paid = record.payments.reduce((sum, p) => sum + p.amount, 0);
    if (!amount || amount > record.totalDue - paid) return res.status(400).json({ message: "Payment exceeds the outstanding balance" });
    record.payments.push({ ...req.body, amount });
    const updatedPaid = paid + amount;
    record.status = updatedPaid >= record.totalDue ? "paid" : "partial";
    await record.save();
    res.status(201).json(record);
  } catch (e) { next(e); }
});
module.exports = router;
