const AcademicYear = require("../models/academicYearModel");
const Student = require("../models/studentModel");
const globalFunctions = require("../utils/globalFuctions");
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const StudyCentre = require("../models/studyCentreModel");

exports.getStudent = globalFunctions.getOne(
  Student,
  "branch",
  "class",
  "academicYear",
  "transferredFrom"
);

exports.getAllStudents = async (req, res, next) => {
  try {
    let query = {
      deleted: { $ne: true },
      completed: { $ne: true },
      droppedOut: { $ne: true },
    }; // Initialize an empty query object
    let data = [];

    // Check query parameters and set conditions accordingly
    if (req.query.all) {
      // Fetch all students if 'all' is true
      data = await Student.find({
        deleted: { $ne: true },
        completed: { $ne: true },
        droppedOut: { $ne: true },
      })
        .populate("branch")
        .populate("class")
        .sort({ registerNo: 1 });
    } else {
      // Set query conditions based on provided parameters
      if (req.query.studyCentre) {
        query.branch = req.query.studyCentre; // Add branch condition if studyCentre is provided
      }
      if (req.query.classId) {
        query.class = req.query.classId; // Add class condition if classId is provided
      }

      // Fetch students based on the constructed query
      data = await Student.find(query)
        .populate("branch")
        .populate("class")
        .sort({ registerNo: 1 });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

exports.getAdmissions = globalFunctions.getAll(Student, "branch", "class");
exports.registerStudent = async (req, res, next) => {
  try {
    let academicYear = await AcademicYear.findOne({ currentYear: true })._id;
    let data = await Student.create({ ...req.body, academicYear });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
exports.addStudent = async (req, res, next) => {
  try {
    let academicYear = await AcademicYear.findOne({ currentYear: true });

    let data = await Student.create({
      ...req.body,
      academicYear: academicYear._id,
      verified: true,
    });
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.updateStudent = globalFunctions.updateOne(Student);

exports.getMyStudents = async (req, res, next) => {
  try {
    let data = await Student.aggregate([
      {
        $match: {
          branch: req.user.branch,
          verified: { $ne: false },
          deleted: { $ne: true },
          droppedOut: { $ne: true },
          class: mongoose.Types.ObjectId(req.params.classId),
          completed: { $ne: true },
        },
      },
      {
        $lookup: {
          from: "classes", // Change "classes" to the actual name of your Class collection
          localField: "class",
          foreignField: "_id",
          as: "class",
        },
      },
      {
        $sort: { registerNo: 1 }, // Sorting by registerNo in ascending order
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.getBranchStudents = async (req, res, next) => {
  try {
    let data = await Student.aggregate([
      {
        $match: {
          branch: mongoose.Types.ObjectId(req.params.studyCentreId),
          class: mongoose.Types.ObjectId(req.params.classId),
          droppedOut: { $ne: true },
          verified: { $ne: false },
          deleted: { $ne: true },
          completed: { $ne: true },
        },
      },
      {
        $sort: { registerNo: 1 }, // Sorting by registerNo in ascending order
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getMyAdmissions = async (req, res, next) => {
  try {
    let data = await Student.find({ branch: req.user.branch, verified: false })
      .populate("class", "className")
      .populate("academicYear")
      .sort({ createdAt: 1 });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.getAllAdmissionRequests = async (req, res, next) => {
  try {
    let data = await Student.find({ verified: false })
      .populate("branch", "studyCentreName")
      .populate("class", "className")
      .sort({ createdAt: 1 });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

exports.getAdmissionRequests = async (req, res, next) => {
  try {
    let data = await Student.aggregate([
      { $match: { verified: false } },
      {
        $group: {
          _id: "$branch",
          numStudents: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "studycentres",
          localField: "_id",
          foreignField: "_id",
          as: "branch",
        },
      },
    ]);

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};
exports.deleteStudent = globalFunctions.deleteOne(Student);
exports.excelUpload = async (req, res) => {
  try {
    let academicYear = await AcademicYear.findOne({ currentYear: true });

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet);
    if (jsonData.length === 0) {
      res.status(400).json({ message: "Please add data" });
    } else {
      await Promise.all(
        jsonData.map(async (data) => {
          const student = new Student({
            ...data,
            class: req.body.class,
            branch: req.user.branch,
            verified: true,
            deleted: false,
            academicYear: academicYear._id,
            dateOfBirth: `${data.dobDate}-${data.dobMonth}-${data.dobYear}`,
          });
          await student.save();
        })
      );

      res.status(200).json({ message: "Excel data uploaded successfully" });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// drop out
exports.dropOutStudents = async (req, res, next) => {
  try {
    const studentIds = req.body.studentIds;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "studentIds is required and must be a non-empty array.",
      });
    }

    const updatePromises = studentIds.map((id) => {
      return Student.findByIdAndUpdate(id, { droppedOut: true });
    });

    await Promise.all(updatePromises);
    res
      .status(200)
      .json({ message: "Selected students have been marked as dropped out" });
  } catch (error) {
    console.error("Error dropping out students:", error);
    next(error);
  }
};

// dropout student
exports.dropOutStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required." });
    }

    const student = await Student.findByIdAndUpdate(studentId, {
      droppedOut: true,
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res
      .status(200)
      .json({ message: "Student has been marked as dropped out." });
  } catch (error) {
    console.error("Error dropping out student:", error);
    next(error);
  }
};

// get dropout list
exports.getDropoutList = async (req, res, next) => {
  try {
    const students = await Student.find({
      droppedOut: true,
      branch: req.user.branch,
    })
      .populate("branch", "studyCentreName")
      .populate("class", "className")
      .sort({ updatedAt: -1 }); // Sort by most recent dropouts first

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching dropout list:", error);
    next(error);
  }
};

// promote students to next class
exports.promoteStudents = async (req, res, next) => {
  try {
    const { studentIds } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "studentIds is required and must be a non-empty array.",
      });
    }

    // Find the selected students
    const students = await Student.find({ _id: { $in: studentIds } });

    console.log("Students to promote:", students);
    console.log("Target class ID:", req.body.classId);

    if (!students.length) {
      return res.status(404).json({ message: "No students found to promote" });
    }

    // Promote each student to the  given class
    const updatePromises = students.map((student) => {
      return Student.updateOne(
        { _id: student._id },
        { class: req.body.classId }
      );
    });

    await Promise.all(updatePromises);

    res
      .status(200)
      .json({ message: "Selected students promoted successfully" });
  } catch (error) {
    console.error("Error promoting students:", error);
    next(error);
  }
};

// recover dropped out students
exports.recoverDroppedOutStudents = async (req, res, next) => {
  try {
    const studentIds = req.body.studentIds;
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({
        message: "studentIds is required and must be a non-empty array.",
      });
    }

    const updatePromises = studentIds.map((id) => {
      return Student.findByIdAndUpdate(id, { droppedOut: false });
    });

    await Promise.all(updatePromises);
    res.status(200).json({ message: "Selected students have been recovered" });
  } catch (error) {
    console.error("Error recovering students:", error);
    next(error);
  }
};

// bulk delete students with class
exports.bulkDeleteStudentsOfClass = async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!classId) {
      return res
        .status(400)
        .json({ message: "classId is required in the request params." });
    }

    await Student.deleteMany({ class: classId });
    res
      .status(200)
      .json({ message: "All students from the class have been deleted." });
  } catch (error) {
    console.error("Error deleting students:", error);
    next(error);
  }
};

// bulk import students from excel file with classId and branchCode per student row
const parseExcelFile = async (file) => {
  const workbook = xlsx.read(file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  // Map Excel columns to DB fields
  return rows.map((row) => ({
    registerNo: row["REG. NO"]?.toString().trim(),
    name: row["NAME"]?.toString().trim(),
    fatherName: row["FATHER"]?.toString().trim(),
    house: row["HOUSE"]?.toString().trim(),
    place: row["PLACE"]?.toString().trim(),
    postOffice: row["PO"]?.toString().trim(),
    pinCode: row["PINCODE"]?.toString().trim(),
    district: row["DISTRICT"]?.toString().trim(),
    state: row["STATE"]?.toString().trim(),
    phone: row["PHONE"]?.toString().trim(),
    dateOfBirth: row["DOB"]?.toString().trim(),
    className: row["CLASS"]?.toString().trim(),
    studyCentreName: row["STUDY CENTRE"]?.toString().trim(),
    studyCentreCode: row["CENTRE CODE"]?.toString().trim(),
  }));
};

exports.bulkImportStudentsWithClassAndBranch = async (req, res, next) => {
  try {
    const { classId } = req.params;
    if (!classId) {
      return res.status(400).json({
        message: "classId is required in the request params.",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Excel file is required." });
    }

    // Parse Excel
    const rawStudents = await parseExcelFile(file);

    // Collect unique studyCentreCodes from Excel
    const studyCentreCodes = [
      ...new Set(rawStudents.map((s) => s.studyCentreCode)),
    ];

    // Find all study centres for those codes
    const studyCentres = await StudyCentre.find({
      studyCentreCode: { $in: studyCentreCodes },
    });

    // Create a lookup map for studyCentreCode → branchId
    const branchMap = {};
    studyCentres.forEach((sc) => {
      branchMap[sc.studyCentreCode] = sc._id;
    });

    // Get current academic year
    const academicYear = await AcademicYear.findOne({ currentYear: true });

    // Map students to DB format
    const students = rawStudents.map((student) => {
      const branchId = branchMap[student.studyCentreCode];
      if (!branchId) {
        throw new Error(
          `No StudyCentre found for CENTRE CODE: ${student.studyCentreCode}`
        );
      }

      return {
        registerNo: student.registerNo,
        studentName: student.name,
        fatherName: student.fatherName,
        house: student.house,
        place: student.place,
        postOffice: student.postOffice,
        pinCode: student.pinCode,
        district: student.district,
        state: student.state,
        phone: student.phone,
        dateOfBirth: student.dateOfBirth,
        class: classId,
        branch: branchId,
        academicYear: academicYear?._id,
        verified: true,
        deleted: false,
      };
    });

    await Student.insertMany(students);

    res.status(201).json({ message: "Students imported successfully." });
  } catch (error) {
    console.error("Error importing students:", error);
    next(error);
  }
};
