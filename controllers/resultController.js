// controllers/resultsController.js
const mongoose = require("mongoose");
const Result = require("../models/resultModel");
const Student = require("../models/studentModel");
const CceMark = require("../models/cceModel");
const { deleteOne } = require("../utils/globalFuctions");

// Helper to parse marks and absent
function parseMarkInput(marksObtained) {
  if (marksObtained === "A" || marksObtained === "a") {
    return { absent: true, marks: null };
  }
  const num = Number(marksObtained);
  return {
    absent: Number.isNaN(num) ? false : false,
    marks: Number.isNaN(num) ? 0 : num,
  };
}

exports.getMyResults = async (req, res) => {
  try {
    const student = await Student.findOne({ registerNo: req.params.registerNo })
      .populate("branch")
      .populate("class");

    if (!student) {
      return res.status(404).json({ message: "Student Not Found" });
    }

    let results = await Result.find({ student: student._id })
      .populate("student")
      .populate("subject")
      .populate("exam");

    let cceResults = await CceMark.find({ student: student._id })
      .populate("student")
      .populate("subject")
      .populate("exam");

    // Map results for client: show "A" when absent
    const mappedResults = results.map((r) => {
      const obj = r.toObject();
      return {
        ...obj,
        marksObtained: obj.absent
          ? "A"
          : typeof obj.marksObtained === "number"
          ? obj.marksObtained
          : 0,
      };
    });

    const mappedCce = cceResults.map((cce) => {
      const obj = cce.toObject();
      return {
        ...obj,
        cceMark:
          obj.cceMark === "A"
            ? "A"
            : typeof obj.cceMark === "number"
            ? obj.cceMark
            : Number(obj.cceMark) || 0,
      };
    });

    if (mappedResults.length === 0 && mappedCce.length === 0) {
      return res.status(200).json({ message: "Result Not Found" });
    }

    // Sum only numeric marks (exclude absent)
    const grandTotal = results.reduce((total, r) => {
      return (
        total + (typeof r.marksObtained === "number" ? r.marksObtained : 0)
      );
    }, 0);

    const totalPossibleMarks = results.length * 100;
    const percentage = totalPossibleMarks
      ? (grandTotal / totalPossibleMarks) * 100
      : 0;
    const roundedPercentage = Math.floor(percentage);

    return res.json({
      results: mappedResults,
      cceResults: mappedCce,
      grandTotal,
      percentage: roundedPercentage,
      totalPossibleMarks,
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getResults = async (req, res) => {
  try {
    if (!req.query.classId || !req.query.examId) {
      return res
        .status(400)
        .json({ message: "Class ID and Exam ID are required" });
    }

    const resultQuery = {
      class: mongoose.Types.ObjectId(req.query.classId),
      exam: mongoose.Types.ObjectId(req.query.examId),
    };

    const results = await Result.find(resultQuery)
      .populate({
        path: "student",
        match: { droppedOut: { $ne: true } },
        populate: [{ path: "branch" }, { path: "class" }],
      })
      .populate("subject")
      .sort({ "student.registerNo": 1 });

    const cceResults = await CceMark.find(resultQuery)
      .populate({
        path: "student",
        match: { droppedOut: { $ne: true } },
        populate: [{ path: "branch" }, { path: "class" }],
      })
      .populate("subject")
      .sort({ "student.branch": 1 });

    const studentResults = {};

    results.forEach((result) => {
      const studentId = result?.student?._id?.toString();
      if (!studentId) return; // ignore results without populated student
      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          student: result.student,
          totalMarks: 0,
          examMarksObtained: 0,
          cceMarksObtained: 0,
          subjectResults: [],
        };
      }

      studentResults[studentId].examMarksObtained +=
        typeof result.marksObtained === "number" ? result.marksObtained : 0;
      studentResults[studentId].subjectResults.push({
        subject: result.subject,
        marksObtained: result.absent ? "A" : result.marksObtained,
        type: "exam",
      });
    });

    cceResults.forEach((cceResult) => {
      const studentId = cceResult?.student?._id?.toString();
      if (!studentId) return;
      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          student: cceResult.student,
          totalMarks: 0,
          examMarksObtained: 0,
          cceMarksObtained: 0,
          subjectResults: [],
        };
      }

      const numericCce =
        cceResult.cceMark === "A" ? 0 : Number(cceResult.cceMark) || 0;
      studentResults[studentId].cceMarksObtained += numericCce;
      studentResults[studentId].subjectResults.push({
        subject: cceResult.subject,
        marksObtained: cceResult.cceMark,
        type: "cce",
      });
    });

    const sortedStudents = Object.values(studentResults).sort((a, b) =>
      (a.student?.registerNo || "")
        .toString()
        .localeCompare((b.student?.registerNo || "").toString())
    );

    const filteredStudents = req.query.studyCentreId
      ? sortedStudents.filter(
          (studentResult) =>
            studentResult?.student?.branch?._id?.toString() ===
            req.query.studyCentreId
        )
      : sortedStudents;

    const modifiedResults = filteredStudents.map((studentResult, index) => {
      const totalExamMarks = studentResult.subjectResults
        .filter((r) => r.type === "exam")
        .reduce(
          (sum, r) =>
            sum +
            (r.subject && r.subject.totalMarks ? r.subject.totalMarks : 0),
          0
        );

      const totalCCEMarks = studentResult.subjectResults
        .filter((r) => r.type === "cce")
        .reduce(
          (sum, r) =>
            sum +
            (r.subject && r.subject.totalMarks ? r.subject.totalMarks : 0),
          0
        );

      const marksObtained =
        (studentResult.examMarksObtained || 0) +
        (studentResult.cceMarksObtained || 0);
      const totalMarks = totalExamMarks + totalCCEMarks;
      const percentage = totalMarks ? (marksObtained / totalMarks) * 100 : 0;

      const passed = studentResult.subjectResults.every((subjectResult) => {
        if (subjectResult.type === "exam") {
          // if this exam subject has a cce counterpart, include cce marks in pass condition
          const cceSubject = studentResult.subjectResults.find(
            (sr) =>
              sr.subject._id.toString() ===
                subjectResult.subject._id.toString() && sr.type === "cce"
          );
          const cceMarks = cceSubject
            ? cceSubject.marksObtained === "A"
              ? 0
              : Number(cceSubject.marksObtained) || 0
            : 0;

          const examMarks =
            subjectResult.marksObtained === "A"
              ? 0
              : Number(subjectResult.marksObtained) || 0;

          return examMarks >= 28 && cceMarks >= 1 && examMarks + cceMarks >= 40;
        }
        return true;
      });

      return {
        student: studentResult.student,
        subjectResults: studentResult.subjectResults,
        passed,
        failed: !passed,
        percentage,
        rank: index + 1,
        marksObtained,
        totalMarks,
        examMarks: studentResult.examMarksObtained,
        cceMarks: studentResult.cceMarksObtained,
      };
    });

    return res.json(modifiedResults);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getGlobalResults = async (req, res) => {
  try {
    const data = await Result.aggregate([
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
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createResults = async (req, res) => {
  const resultsData = Array.isArray(req.body) ? req.body : [req.body];

  try {
    const bulkOps = resultsData.map((r) => {
      const { student, exam, marksObtained, class: studentClass, subject } = r;

      let absent = false;
      let markNum = null;

      if (marksObtained === "A" || marksObtained === "a") {
        // Absent
        absent = true;
        markNum = null;
      } else {
        const parsed = Number(marksObtained);
        markNum = Number.isNaN(parsed) ? 0 : parsed;
      }

      return {
        updateOne: {
          filter: {
            student: mongoose.Types.ObjectId(student),
            subject: mongoose.Types.ObjectId(subject),
            exam: mongoose.Types.ObjectId(exam),
          },
          update: {
            // ❗ Only put fields that can change here
            $set: {
              marksObtained: markNum,
              absent,
            },
            // ❗ Only initial values on insert here (no conflict with $set)
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

    const results = await Result.bulkWrite(bulkOps, { ordered: false });

    return res.status(201).json({ message: "Results processed", results });
  } catch (err) {
    console.error("createResults error:", err);

    // Duplicate key from unique index (student+exam+subject+class)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Duplicate mark entry for the subject (unique constraint)." });
    }

    return res.status(400).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const updates = req.body.map(async (row) => {
      const { _id, marksObtained } = row;
      if (!_id || marksObtained === undefined) return null;

      const { absent, marks } =
        marksObtained === "A" || marksObtained === "a"
          ? { absent: true, marks: null }
          : {
              absent: false,
              marks: Number.isNaN(Number(marksObtained))
                ? 0
                : Number(marksObtained),
            };

      return await Result.findByIdAndUpdate(
        _id,
        { marksObtained: marks, absent },
        { new: true }
      );
    });

    const resolved = (await Promise.all(updates)).filter(Boolean);
    return res.json(resolved);
  } catch (err) {
    console.error("updateResult error:", err);
    return res.status(400).json({ message: err.message });
  }
};

exports.fetchToUpdate = async (req, res) => {
  try {
    const { examId, subjectId, classId } = req.query;
    const result = await Result.find({
      exam: mongoose.Types.ObjectId(examId),
      subject: mongoose.Types.ObjectId(subjectId),
      class: mongoose.Types.ObjectId(classId),
    })
      .populate("student")
      .populate("exam");

    if (!result || result.length === 0)
      return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    console.error("fetchToUpdate error:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getExamStatistics = async (req, res) => {
  try {
    const result = await Result.aggregate([
      {
        $match: {
          exam: mongoose.Types.ObjectId(req.query.examId),
          deleted: { $ne: true },
        },
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
                    { $gte: ["$marksObtained", 40] },
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
                    { $lt: ["$marksObtained", 40] },
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

    if (!result) return res.status(404).json({ message: "Result not found" });
    return res.json(result);
  } catch (err) {
    console.error("getExamStatistics error:", err);
    return res.status(400).json({ message: err.message });
  }
};

exports.deleteResult = deleteOne(Result);
