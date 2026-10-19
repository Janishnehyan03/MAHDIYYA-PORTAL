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
    const { academicYear, affiliationFeeM1M2, affiliationFeeDegree, perStudentFee, affiliationFee } = req.body;
    const m1m2 = affiliationFeeM1M2 !== undefined && affiliationFeeM1M2 !== "" ? Number(affiliationFeeM1M2) : (affiliationFee !== undefined ? Number(affiliationFee) : 1000);
    const degree = affiliationFeeDegree !== undefined && affiliationFeeDegree !== "" ? Number(affiliationFeeDegree) : 1500;
    const perStudent = Number(perStudentFee);

    if (!academicYear || isNaN(m1m2) || isNaN(degree) || isNaN(perStudent)) {
      return res.status(400).json({ message: "Academic year and valid fee amounts are required" });
    }

    const rate = await FeeRate.create({
      academicYear,
      affiliationFeeM1M2: m1m2,
      affiliationFeeDegree: degree,
      affiliationFee: m1m2,
      perStudentFee: perStudent,
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

    // Identify all classes categorized as DEGREE
    const degreeClasses = await Class.find({ courseLevel: "DEGREE" }).select("_id");
    const degreeClassIds = degreeClasses.map((c) => c._id);

    const centres = await Branch.find({ isActive: { $ne: false } });
    const AcademicYear = require("../models/academicYearModel");
    const academicYearRecord = await AcademicYear.findOne({ year: academicYear });
    const records = [];

    const m1m2Rate = rate.affiliationFeeM1M2 !== undefined ? rate.affiliationFeeM1M2 : (rate.affiliationFee || 1000);
    const degreeRate = rate.affiliationFeeDegree !== undefined ? rate.affiliationFeeDegree : 1500;

    for (const centre of centres) {
      const studentFilter = { branch: centre._id, droppedOut: { $ne: true }, deleted: { $ne: true } };
      if (academicYearRecord) studentFilter.academicYear = academicYearRecord._id;
      const studentCount = await Student.countDocuments(studentFilter);

      let hasDegreeStudents = false;
      if (degreeClassIds.length > 0) {
        const degreeStudentCount = await Student.countDocuments({
          ...studentFilter,
          class: { $in: degreeClassIds },
        });
        hasDegreeStudents = degreeStudentCount > 0;
      }

      const affiliationType = hasDegreeStudents ? "DEGREE" : "M1_M2";
      const affiliationFee = hasDegreeStudents ? degreeRate : m1m2Rate;
      const totalDue = affiliationFee + studentCount * rate.perStudentFee;

      const existing = await FeeCollection.findOne({ studyCentre: centre._id, academicYear });
      if (existing) {
        const paid = existing.payments.reduce((sum, p) => sum + p.amount, 0);
        existing.affiliationFee = affiliationFee;
        existing.affiliationType = affiliationType;
        existing.perStudentFee = rate.perStudentFee;
        existing.studentCount = studentCount;
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
          perStudentFee: rate.perStudentFee,
          studentCount,
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
