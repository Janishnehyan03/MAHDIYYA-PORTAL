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

    let results = await Result.find({
      student: student._id,
    })
      .populate("student")
      .populate("subject")
      .populate("exam");

    if (results.length === 0) {
      return res.status(200).json({ message: "Result Not Found" });
    }

    const allSubjectsPassed = results.every(
      (result) => result.marksObtained >= 40
    );

    const grandTotal = results.reduce(
      (total, result) => total + result.marksObtained,
      0
    );

    // Calculate total possible marks (assuming each subject has a maximum of 100 marks)
    const totalPossibleMarks = results.length * 100;

    // Calculate percentage
    const percentage = (grandTotal / totalPossibleMarks) * 100;
    const roundedPercentage = Math.floor(percentage);
    // Rank const studentClassId = student.class;

    // Find all students in the same class
    const classmates = await Student.find({
      class: student.class,
      branch: student.branch,
    });

    // Calculate grand total for each student
    const grandTotals = await Promise.all(
      classmates.map(async (classmate) => {
        const classmateResults = await Result.find({ student: classmate._id });
        return classmateResults.reduce(
          (total, result) => total + result.marksObtained,
          0
        );
      })
    );

    // Sort classmates by grand total in descending order
    const sortedClassmates = classmates
      .map((classmate, index) => ({
        classmate,
        grandTotal: grandTotals[index],
      }))
      .sort((a, b) => b.grandTotal - a.grandTotal);

    // Find the rank of the current student
    let studentRank = 1;
    let prevGrandTotal = Infinity;
    for (const { classmate, grandTotal } of sortedClassmates) {
      if (grandTotal < prevGrandTotal) {
        studentRank += 1;
        prevGrandTotal = grandTotal;
      }

      if (classmate._id.equals(student._id)) {
        break;
      }
    }

    return res.json({
      results,
      promoted: allSubjectsPassed,
      grandTotal,
      percentage: roundedPercentage,
      totalPossibleMarks,
      studentRank: studentRank - 1,
      student,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
// exports.getResults = async (req, res) => {
//   try {
//     let results;
//     if (req.query.classId && req.query.examId) {
//       results = await Result.find({
//         class: mongoose.Types.ObjectId(req.query.classId),
//         exam: mongoose.Types.ObjectId(req.query.examId),
//       })
//         .populate("student")
//         .populate("subject");

//       if (results.length === 0) {
//         return res.status(404).json({ message: "No results found" });
//       }

//       const studentResults = {};
//       results.forEach((result) => {
//         const studentId = result?.student?._id.toString();
//         if (!studentResults[studentId]) {
//           studentResults[studentId] = {
//             student: result.student,
//             totalMarks: 0,
//             subjectResults: [],
//           };
//         }
//         studentResults[studentId].totalMarks += result.marksObtained;
//         studentResults[studentId].subjectResults.push({
//           subject: result.subject,
//           marksObtained: result.marksObtained,
//         });
//       });

//       // Sort the students based on the total marks obtained
//       const sortedStudents = Object.values(studentResults).sort(
//         (a, b) => b.totalMarks - a.totalMarks
//       );

//       const filteredStudents = sortedStudents.filter(
//         (studentResult) =>
//           studentResult?.student?.branch?._id.toString() ===
//           req.query.studyCentreId
//       );

//       const modifiedResults = filteredStudents.map((studentResult, index) => {
//         const totalMarks = studentResult.subjectResults.reduce(
//           (sum, subjectResult) => sum + subjectResult.subject.totalMarks,
//           0
//         );
//         const marksObtained = studentResult.totalMarks;
//         const percentage = (marksObtained / totalMarks) * 100;
//         const passed = studentResult.subjectResults.every(
//           (subjectResult) => subjectResult.marksObtained >= 40
//         );

//         const rank = index + 1; // Assign rank based on the sorted order

//         return {
//           student: studentResult.student,
//           subjectResults: studentResult.subjectResults,
//           passed,
//           failed: !passed,
//           percentage,
//           rank,
//           marksObtained,
//           totalMarks,
//           // Add any other required fields here
//         };
//       });
//       return res.json(modifiedResults);
//     }
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ error: "Internal Server Error" });
//   }
// };

exports.getResults = async (req, res) => {
  try {
    let results;

    if (req.query.classId && req.query.examId) {
      // Fetch exam results based on class and exam IDs, sorted by student registerNo
      results = await Result.find({
        class: mongoose.Types.ObjectId(req.query.classId),
        exam: mongoose.Types.ObjectId(req.query.examId),
      })
        .populate("student")
        .populate("subject")
        .sort({ "student.registerNo": 1 });  // Sort by student registerNo in ascending order

      if (results.length === 0) {
        return res.status(404).json({ message: "No results found" });
      }

      const cceResults = await CceMark.find({
        class: mongoose.Types.ObjectId(req.query.classId),
        exam: mongoose.Types.ObjectId(req.query.examId),
      })
        .populate("student")
        .populate("subject")
        .sort({ "student.registerNo": 1 });  // Sort by student registerNo in ascending order

      // Process results as before (no changes here)
      const studentResults = {};

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

      // Sort and filter as per the previous logic
      const sortedStudents = Object.values(studentResults).sort((a, b) =>
        a.student.registerNo.localeCompare(b.student.registerNo)
      );

      // Filter and return the sorted, modified results
      const filteredStudents = sortedStudents.filter(
        (studentResult) =>
          studentResult?.student?.branch?._id.toString() ===
          req.query.studyCentreId
      );

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
    } else {
      return res
        .status(400)
        .json({ message: "Class ID and Exam ID are required" });
    }
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
  // Expecting resultsData to be an array of result objects from req.body
  const resultsData = Array.isArray(req.body) ? req.body : [req.body]; // Ensure it's an array

  try {
    const results = await Promise.all(
      resultsData.map(async (resultData) => {
        const {
          student,
          exam,
          marksObtained, // Changed to marksObtained
          class: studentClass,
          subject,
        } = resultData;

        // Find existing result by student, subject, and exam
        const existingResult = await Result.findOne({ student, subject, exam });

        if (existingResult) {
          // Prevent duplicate entry by checking if the existing marks are already recorded
          if (existingResult.marksObtained === marksObtained) {
            // If the marks are the same, return the existing result without making changes
            return existingResult;
          } else {
            // Update existing result
            existingResult.marksObtained = marksObtained; // Update field to marksObtained
            await existingResult.save();
            return existingResult; // Return updated result
          }
        } else {
          // Create a new result
          const newResult = new Result({
            student,
            exam,
            marksObtained, // Ensure this is now marksObtained
            class: studentClass,
            subject,
          });
          await newResult.save();
          return newResult; // Return newly created result
        }
      })
    );

    // Respond with the created or updated results
    res.status(201).json(results);
  } catch (err) {
    console.error(err); // Improved error logging

    // Handle validation errors specifically for duplicate marks if necessary
    if (
      err.name === "ValidationError" &&
      err.message.includes("Duplicate mark entry")
    ) {
      return res
        .status(400)
        .json({ error: "Duplicate mark entry for the subject." });
    }

    // General error response
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
