// controllers/cceController.js
const mongoose = require("mongoose");
const CceMark = require("../models/cceModel");
const Student = require("../models/studentModel");
const { deleteOne } = require("../utils/globalFuctions");

// Helper: treat "A" as absent, others as numeric
function parseCceInput(value) {
  if (value === "A" || value === "a") {
    return { absent: true, mark: null };
  }
  const num = Number(value);
  return {
    absent: false,
    mark: Number.isNaN(num) ? 0 : num,
  };
}

// =================== getMyResults ===================
exports.getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ registerNo: req.params.registerNo })
      .populate("branch")
      .populate("class");

    if (!student) {
      return res.status(404).json({ message: "Student Not Found" });
    }

    const results = await CceMark.find({ student: student._id })
      .populate("student")
      .populate("subject")
      .populate("exam");

    if (!results || results.length === 0) {
      return res.status(200).json({ message: "Result Not Found" });
    }

    // All subjects passed? (treat absent as fail)
    const allSubjectsPassed = results.every((result) => {
      const mark = typeof result.cceMark === "number" ? result.cceMark : 0;
      return !result.absent && mark >= 40;
    });

    // Grand total (absent -> 0)
    const grandTotal = results.reduce((total, result) => {
      const mark = typeof result.cceMark === "number" ? result.cceMark : 0;
      return total + mark;
    }, 0);

    const totalPossibleMarks = results.length * 100;
    const percentage = totalPossibleMarks
      ? (grandTotal / totalPossibleMarks) * 100
      : 0;
    const roundedPercentage = Math.floor(percentage);

    // ------- Rank within same class & branch -------
    const classmates = await Student.find({
      class: student.class,
      branch: student.branch,
    });

    const grandTotals = await Promise.all(
      classmates.map(async (classmate) => {
        const classmateResults = await CceMark.find({ student: classmate._id });
        return classmateResults.reduce((total, result) => {
          const mark = typeof result.cceMark === "number" ? result.cceMark : 0;
          return total + mark;
        }, 0);
      })
    );

    const sortedClassmates = classmates
      .map((classmate, index) => ({
        classmate,
        grandTotal: grandTotals[index],
      }))
      .sort((a, b) => b.grandTotal - a.grandTotal);

    const rankIndex = sortedClassmates.findIndex((item) =>
      item.classmate._id.equals(student._id)
    );
    const studentRank = rankIndex === -1 ? null : rankIndex + 1;

    // Map results for client: show "A" for absent
    const mappedResults = results.map((r) => {
      const obj = r.toObject();
      return {
        ...obj,
        cceMark: obj.absent
          ? "A"
          : typeof obj.cceMark === "number"
          ? obj.cceMark
          : 0,
      };
    });

    return res.json({
      results: mappedResults,
      promoted: allSubjectsPassed,
      grandTotal,
      percentage: roundedPercentage,
      totalPossibleMarks,
      studentRank,
      student,
    });
  } catch (err) {
    console.error("getMyResults CCE error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// =================== getResults (class + exam) ===================
exports.getResults = async (req, res) => {
  try {
    if (!req.query.classId || !req.query.examId) {
      return res
        .status(400)
        .json({ message: "Class ID and Exam ID are required" });
    }

    const results = await CceMark.find({
      class: mongoose.Types.ObjectId(req.query.classId),
      exam: mongoose.Types.ObjectId(req.query.examId),
    })
      .populate({
        path: "student",
        match: { droppedOut: { $ne: true } },
        populate: [{ path: "branch" }, { path: "class" }],
      })
      .populate({
        path: "subject",
        match: { class: mongoose.Types.ObjectId(req.query.classId) },
      });

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "No results found" });
    }

    const studentResults = {};
    results.forEach((result) => {
      const studentId = result?.student?._id?.toString();
      if (!studentId) return;

      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          student: result.student,
          totalMarksObtained: 0,
          subjectResults: [],
        };
      }

      const mark = result.absent
        ? 0
        : typeof result.cceMark === "number"
        ? result.cceMark
        : 0;

      studentResults[studentId].totalMarksObtained += mark;
      studentResults[studentId].subjectResults.push({
        subject: result.subject,
        cceMark: result.absent ? "A" : mark,
        absent: result.absent,
      });
    });

    // Filter by centre if provided, then sort by registerNo
    const filteredStudents = Object.values(studentResults)
      .filter((sr) =>
        req.query.studyCentreId
          ? sr?.student?.branch?._id?.toString() === req.query.studyCentreId
          : true
      )
      .sort((a, b) => {
        const aReg = (a.student.registerNo || "").toString();
        const bReg = (b.student.registerNo || "").toString();
        return aReg.localeCompare(bReg);
      });

    const modifiedResults = filteredStudents.map((studentResult, index) => {
      const totalMarks = studentResult.subjectResults.reduce(
        (sum, subjectResult) => {
          const totalForSubject =
            subjectResult.subject && subjectResult.subject.totalMarks != null
              ? subjectResult.subject.totalMarks
              : 0;
          return sum + totalForSubject;
        },
        0
      );

      const cceMarkTotal = studentResult.totalMarksObtained;
      const percentage = totalMarks ? (cceMarkTotal / totalMarks) * 100 : 0;

      const passed = studentResult.subjectResults.every((subjectResult) => {
        const mark =
          subjectResult.cceMark === "A"
            ? 0
            : Number(subjectResult.cceMark) || 0;
        return !subjectResult.absent && mark >= 40;
      });

      return {
        student: studentResult.student,
        subjectResults: studentResult.subjectResults,
        passed,
        failed: !passed,
        percentage,
        rank: index + 1,
        cceMark: cceMarkTotal,
        totalMarks,
      };
    });

    return res.json(modifiedResults);
  } catch (err) {
    console.error("CCE getResults error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// =================== getGlobalResults ===================
exports.getGlobalResults = async (req, res) => {
  try {
    const data = await CceMark.aggregate([
      { $match: { deleted: { $ne: true } } },
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student_info",
        },
      },
      { $unwind: "$student_info" },
      {
        $lookup: {
          from: "branches",
          localField: "student_info.branch",
          foreignField: "_id",
          as: "branch_info",
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "student_info.class",
          foreignField: "_id",
          as: "class_info",
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectInfo",
        },
      },
      { $unwind: "$branch_info" },
      { $unwind: "$class_info" },
      { $unwind: "$subjectInfo" },
      {
        $group: {
          _id: {
            className: "$class_info.className",
            class_id: "$class_info._id",
            studyCentreName: "$branch_info.studyCentreName",
            branch_id: "$branch_info._id",
            studyCentreCode: "$branch_info.studyCentreCode",
            subject: "$subjectInfo.subjectName",
            examId: "$exam",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json(data);
  } catch (err) {
    console.error("CCE getGlobalResults error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

// =================== createResults (CCE) ===================
exports.createResults = async (req, res) => {
  const resultsData = Array.isArray(req.body) ? req.body : [req.body];

  try {
    const bulkOps = resultsData.map((r) => {
      const { student, exam, cceMark, class: studentClass, subject } = r;
      const { absent, mark } = parseCceInput(cceMark);

      return {
        updateOne: {
          filter: {
            student: mongoose.Types.ObjectId(student),
            subject: mongoose.Types.ObjectId(subject),
            exam: mongoose.Types.ObjectId(exam),
          },
          update: {
            $set: {
              cceMark: mark,
              absent,
            },
            $setOnInsert: {
              student: mongoose.Types.ObjectId(student),
              exam: mongoose.Types.ObjectId(exam),
              subject: mongoose.Types.ObjectId(subject),
              class: mongoose.Types.ObjectId(studentClass),
            },
          },
          upsert: true,
        },
      };
    });

    const results = await CceMark.bulkWrite(bulkOps, { ordered: false });

    res.status(201).json({ message: "CCE results processed", results });
  } catch (err) {
    console.error("CCE createResults error:", err);

    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Duplicate CCE mark entry for this subject." });
    }

    if (
      err.name === "ValidationError" &&
      err.message.includes("Duplicate mark entry")
    ) {
      return res
        .status(400)
        .json({ error: "Duplicate CCE mark entry for the subject." });
    }

    res.status(400).json({ message: err.message });
  }
};

// =================== updateResult (CCE) ===================
exports.updateResult = async (req, res) => {
  try {
    const results = await Promise.all(
      req.body.map(async (resultData) => {
        const { _id, cceMark } = resultData;
        if (!_id || cceMark === undefined) return null;

        const { absent, mark } = parseCceInput(cceMark);

        return await CceMark.findByIdAndUpdate(
          _id,
          { cceMark: mark, absent },
          { new: true }
        );
      })
    );

    const filteredResults = results.filter(Boolean);
    res.json(filteredResults);
  } catch (err) {
    console.error("CCE updateResult error:", err);
    res.status(400).json({ message: err.message });
  }
};

// =================== fetchToUpdate ===================
exports.fetchToUpdate = async (req, res) => {
  try {
    const { examId, subjectId, classId } = req.query;

    const result = await CceMark.find({
      exam: mongoose.Types.ObjectId(examId),
      subject: mongoose.Types.ObjectId(subjectId),
      class: mongoose.Types.ObjectId(classId),
    })
      .populate({ path: "student" })
      .populate("exam");

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "Result not found" });
    }
    res.json(result);
  } catch (err) {
    console.error("CCE fetchToUpdate error:", err);
    res.status(400).json({ message: err.message });
  }
};

// =================== getExamStatistics ===================
exports.getExamStatistics = async (req, res) => {
  try {
    const result = await CceMark.aggregate([
      {
        $match: { exam: mongoose.Types.ObjectId(req.query.examId) },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subjectDetails",
        },
      },
      { $unwind: "$subjectDetails" },
      {
        $group: {
          _id: {
            subjectId: "$subject",
            subjectName: "$subjectDetails.subjectName",
          },
          passed: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gte: ["$cceMark", 40] },
                    { $eq: ["$absent", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          failed: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $lt: ["$cceMark", 40] },
                    { $eq: ["$absent", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          subjectId: "$_id.subjectId",
          subjectName: "$_id.subjectName",
          passed: 1,
          failed: 1,
        },
      },
    ]);

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
  } catch (err) {
    console.error("CCE getExamStatistics error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteResult = deleteOne(CceMark);
