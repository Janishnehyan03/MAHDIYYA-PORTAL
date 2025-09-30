const { default: mongoose } = require("mongoose");
const Result = require("../models/resultModel");
const Student = require("../models/studentModel");
const CceMark = require("../models/cceModel");
const { deleteOne } = require("../utils/globalFuctions");

exports.getMyResults = async (req, res) => {
  try {
    let student = await Student.findOne({ registerNo: req.params.registerNo })
      .populate("branch")
      .populate("class");

    if (!student) {
      return res.status(404).json({ message: "Student Not Found" });
    }

    // Exam results
    let results = await Result.find({
      student: student._id,
    })
      .populate("student")
      .populate("subject")
      .populate("exam");

    // CCE Results
    let cceResults = await CceMark.find({
      student: student._id,
    })
      .populate("student")
      .populate("subject")
      .populate("exam");

    // Make sure marksObtained is always a number for Results
    results = results.map((result) => ({
      ...result.toObject(),
      marksObtained:
        typeof result.marksObtained === "number" ? result.marksObtained : 0,
    }));

    // Make sure cceMark is a number or "A" for CCE (or 0 if invalid/missing)
    cceResults = cceResults.map((cce) => ({
      ...cce.toObject(),
      cceMark:
        cce.cceMark === "A"
          ? "A"
          : typeof cce.cceMark === "number"
          ? cce.cceMark
          : Number(cce.cceMark) || 0,
    }));

    if (results.length === 0 && cceResults.length === 0) {
      return res.status(200).json({ message: "Result Not Found" });
    }

    // Only calculate grand total, total marks, and percentage from main exam results
    const grandTotal = results.reduce(
      (total, result) => total + result.marksObtained,
      0
    );
    const totalPossibleMarks = results.length * 100;
    const percentage = totalPossibleMarks
      ? (grandTotal / totalPossibleMarks) * 100
      : 0;
    const roundedPercentage = Math.floor(percentage);

    // Respond with both results arrays, student info, and stats
    return res.json({
      results,
      cceResults,
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

    // Fetch exam results based on class and exam IDs
    const resultQuery = {
      class: mongoose.Types.ObjectId(req.query.classId),
      exam: mongoose.Types.ObjectId(req.query.examId),
    };

    const results = await Result.find(resultQuery)
      .populate({
        path: "student",
        match: { droppedOut: { $ne: true } }, // Only include students who have not dropped out
        populate: [
          { path: "branch" }, // Populate branch details
          { path: "class" }, // Populate class details
        ],
      })
      .populate("subject")
      .sort({ "student.registerNo": 1 });

    // if (results.length === 0) {
    //   return res.status(404).json({ message: "No results found" });
    // }

    const cceResults = await CceMark.find(resultQuery)
      .populate({
        path: "student",
        match: { droppedOut: { $ne: true } }, // Only include students who have not dropped out
        populate: [
          { path: "branch" }, // Populate branch details
          { path: "class" }, // Populate class details
        ],
      })
      .populate("subject")
      .sort({ "student.branch": 1 });

    const studentResults = {};

    // Process results to compile student data
    results.forEach((result) => {
      const studentId = result?.student?._id.toString();
      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          student: result.student,
          totalMarks: 0,
          examMarksObtained: 0,
          cceMarksObtained: 0,
          subjectResults: [],
        };
      }

      studentResults[studentId].examMarksObtained += result.marksObtained;
      studentResults[studentId].subjectResults.push({
        subject: result.subject,
        marksObtained: result.marksObtained,
        type: "exam",
      });
    });

    cceResults.forEach((cceResult) => {
      const studentId = cceResult?.student?._id.toString();
      if (!studentResults[studentId]) {
        studentResults[studentId] = {
          student: cceResult.student,
          totalMarks: 0,
          examMarksObtained: 0,
          cceMarksObtained: 0,
          subjectResults: [],
        };
      }

      studentResults[studentId].cceMarksObtained += cceResult.cceMark;
      studentResults[studentId].subjectResults.push({
        subject: cceResult.subject,
        marksObtained: cceResult.cceMark,
        type: "cce",
      });
    });

    const sortedStudents = Object.values(studentResults).sort((a, b) =>
      a.student?.registerNo?.localeCompare(b?.student?.registerNo)
    );

    // Apply studyCentreId filtering if it is provided
    const filteredStudents = req.query.studyCentreId
      ? sortedStudents.filter(
          (studentResult) =>
            studentResult?.student?.branch?._id.toString() ===
            req.query.studyCentreId
        )
      : sortedStudents;

    const modifiedResults = filteredStudents.map((studentResult, index) => {
      const totalExamMarks = studentResult.subjectResults
        .filter((result) => result.type === "exam")
        .reduce((sum, result) => sum + result.subject.totalMarks, 0);

      const totalCCEMarks = studentResult.subjectResults
        .filter((result) => result.type === "cce")
        .reduce((sum, result) => sum + result.subject.totalMarks, 0);

      const marksObtained =
        studentResult.examMarksObtained + studentResult.cceMarksObtained;
      const totalMarks = totalExamMarks + totalCCEMarks;
      const percentage = (marksObtained / totalMarks) * 100;

      const passed = studentResult.subjectResults.every((subjectResult) => {
        if (subjectResult.type === "exam") {
          const cceSubject = studentResult.subjectResults.find(
            (sr) =>
              sr.subject._id.toString() ===
                subjectResult.subject._id.toString() && sr.type === "cce"
          );
          const cceMarks = cceSubject ? cceSubject.marksObtained : 0;
          return (
            subjectResult.marksObtained >= 28 &&
            cceMarks >= 1 &&
            subjectResult.marksObtained + cceMarks >= 40
          );
        }
        return true;
      });

      const rank = index + 1;

      return {
        student: studentResult.student,
        subjectResults: studentResult.subjectResults,
        passed,
        failed: !passed,
        percentage,
        rank,
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
    let data = await Result.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student_info",
        },
      },
      {
        $unwind: "$student_info",
      },
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
      {
        $unwind: "$branch_info",
      },
      {
        $unwind: "$class_info",
      },
      {
        $unwind: "$subjectInfo",
      },

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
          count: { $sum: 1 }, // Optionally, you can count the number of results for each group
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
  const resultsData = Array.isArray(req.body) ? req.body : [req.body]; // Ensure it's an array

  try {
    // Prepare bulk operations
    const bulkOps = resultsData.map((resultData) => {
      const {
        student,
        exam,
        marksObtained,
        class: studentClass,
        subject,
        _id,
      } = resultData;

      return {
        updateOne: {
          filter: { student, subject, exam },
          update: {
            $set: { marksObtained, class: studentClass },
            $setOnInsert: { student, exam, subject },
          },
          upsert: true, // Create if not exists
        },
      };
    });

    // Execute bulk operations
    const results = await Result.bulkWrite(bulkOps);

    // Respond with success
    res.status(201).json({ message: "Results processed", results });
  } catch (err) {
    console.error(err);
    if (
      err.name === "ValidationError" &&
      err.message.includes("Duplicate mark entry")
    ) {
      return res
        .status(400)
        .json({ error: "Duplicate mark entry for the subject." });
    }
    res.status(400).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const results = await Promise.all(
      req.body.map(async (resultData) => {
        const { _id, marksObtained } = resultData;

        // Only update if _id and marksObtained are provided
        if (_id && marksObtained !== undefined) {
          return await Result.findByIdAndUpdate(
            _id,
            { marksObtained: parseInt(marksObtained) }, // Ensure cceMark is an integer
            { new: true }
          );
        }
      })
    );

    // Filter out any undefined results from the update
    const filteredResults = results.filter(Boolean);
    res.json(filteredResults);
  } catch (err) {
    console.error(err); // Changed to console.error for better error logging
    res.status(400).json({ message: err.message });
  }
};

exports.fetchToUpdate = async (req, res) => {
  try {
    let { examId, subjectId, classId } = req.query;

    const result = await Result.find({
      exam: mongoose.Types.ObjectId(examId),
      subject: mongoose.Types.ObjectId(subjectId),
      class: mongoose.Types.ObjectId(classId),
    })
      .populate("student")
      .populate("exam");
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.getExamStatistics = async (req, res) => {
  try {
    const result = await Result.aggregate([
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
      {
        $unwind: "$subjectDetails",
      },
      {
        $group: {
          _id: {
            subjectId: "$subject",
            subjectName: "$subjectDetails.subjectName",
          },
          passed: {
            $sum: {
              $cond: {
                if: {
                  $gte: ["$marksObtained", 40],
                },
                then: 1,
                else: 0,
              },
            },
          },
          failed: {
            $sum: {
              $cond: {
                if: {
                  $lt: ["$marksObtained", 40],
                },
                then: 1,
                else: 0,
              },
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
    // Extract the aggregated data
    if (!result) return res.status(404).json({ message: "Result not found" });
    const examStatistics = result;

    res.json(examStatistics);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteResult = deleteOne(Result);
