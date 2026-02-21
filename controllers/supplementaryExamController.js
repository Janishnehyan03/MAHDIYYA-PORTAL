const SupplementaryExam = require("../models/supplementaryExamModel");
const Class = require("../models/classModel");
const Subject = require("../models/subjectModel");
const Student = require("../models/studentModel");
const Branch = require("../models/studyCentreModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const xlsx = require("xlsx");

exports.getTemplate = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const currentClass = await Class.findById(classId);
  if (!currentClass) {
    return next(new AppError("Class not found", 404));
  }

  const subjects = await Subject.find({ class: classId });

  // Basic headers based on user request ("Exam Reg. No.", "Student Name", "Study Centre Name", "Study Centre Code", "SEMESTER")
  const headers = [
    "Exam Reg. No.",
    "Student Name",
    "Study Centre Name",
    "Study Centre Code",
    "SEMESTER",
  ];

  // Append subject names to headers
  subjects.forEach((subj) => {
    headers.push(subj.subjectName);
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet([headers]);

  xlsx.utils.book_append_sheet(workbook, worksheet, "Supplementary Students");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Supplementary_Template_${currentClass.className}.xlsx`
  );

  res.send(buffer);
});

exports.uploadInitialData = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an excel file", 400));
  }
  const { classId } = req.body;
  if (!classId) {
    return next(new AppError("Class ID is required", 400));
  }

  const currentClass = await Class.findById(classId);
  if (!currentClass) return next(new AppError("Class not found", 404));

  const subjects = await Subject.find({ class: classId });
  const subjectNames = subjects.map((s) => s.subjectName.toUpperCase());

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const errors = [];
  const processedData = [];

  for (let [index, row] of rows.entries()) {
    const regNo = row["Exam Reg. No."]?.toString().trim() || "";
    const studentName = row["Student Name"]?.toString().trim() || "";
    const studyCentreName = row["Study Centre Name"]?.toString().trim() || "";
    const studyCentreCode = row["Study Centre Code"]?.toString().trim() || "";
    const semester = row["SEMESTER"]?.toString().trim() || "";

    if (!regNo || !studentName || !studyCentreCode) {
      continue; // Skip empty/invalid rows silently or track errors
    }

    // Attempt to find branch
    const branch = await Branch.findOne({ studyCentreCode: new RegExp(`^${studyCentreCode}$`, 'i') });
    if (!branch) {
      errors.push(`Row ${index + 2}: Branch with code ${studyCentreCode} not found`);
      continue;
    }

    // Attempt to find student by regNo
    let student = await Student.findOne({
      $or: [{ registerNo: new RegExp(`^${regNo}$`, 'i') }]
    });

    if (!student) {
      // If student not found by regNo, we can either error out or just search by name + branch. Let's try name + branch.
      student = await Student.findOne({
        studentName: new RegExp(`^${studentName}$`, 'i'),
        branch: branch._id,
        class: classId
      });
    }

    if (!student) {
      errors.push(`Row ${index + 2}: Student ${studentName} (${regNo}) not found in the system for this class and branch`);
      continue;
    }

    // Prepare subjects array
    const subjectMarks = [];
    for (const key of Object.keys(row)) {
      const upperKey = key.trim().toUpperCase();
      if (subjectNames.includes(upperKey)) {
        subjectMarks.push({
          subjectName: upperKey,
          mark: row[key]?.toString().trim() || ""
        });
      }
    }

    processedData.push({
      class: classId,
      student: student._id,
      branch: branch._id,
      registerNo: regNo,
      studentName: studentName,
      studyCentreName: studyCentreName,
      studyCentreCode: studyCentreCode,
      semester: semester,
      subjectMarks,
      superAdminUploadedAt: new Date()
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: "fail", message: "Errors found in Excel file", errors });
  }

  // Insert or Update the records
  for (const data of processedData) {
    await SupplementaryExam.findOneAndUpdate(
      { class: data.class, student: data.student },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.status(200).json({
    status: "success",
    message: "Data uploaded successfully and assigned to study centres.",
  });
});

exports.getSuperAdminRecords = catchAsync(async (req, res, next) => {
  const { classId } = req.query;
  const query = {};
  if (classId) query.class = classId;

  const records = await SupplementaryExam.find(query).populate("class").populate("student").populate("branch").sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { records }
  });
});

exports.getStudyCentreRecords = catchAsync(async (req, res, next) => {
  const branchId = req.user.branch || req.user._id; // Depending on how auth works for admin/study centre
  const records = await SupplementaryExam.find({ branch: branchId }).populate("class").populate("student");

  res.status(200).json({
    status: "success",
    data: { records }
  });
});

exports.downloadCentreList = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const branchId = req.user.branch || req.user._id;

  const query = { branch: branchId };
  if (classId) query.class = classId;

  const records = await SupplementaryExam.find(query).populate("class");
  if (!records || records.length === 0) {
    return next(new AppError("No records found to download", 404));
  }

  // Find all subjects from these records to make columns
  let subjectColumns = new Set();
  records.forEach(r => {
    r.subjectMarks.forEach(sm => subjectColumns.add(sm.subjectName));
  });
  const subjectArray = Array.from(subjectColumns);

  const headers = [
    "Exam Reg. No.",
    "Student Name",
    "Study Centre Name",
    "Study Centre Code",
    "SEMESTER",
    ...subjectArray
  ];

  const workbook = xlsx.utils.book_new();
  const rows = [];
  rows.push(headers);

  records.forEach(record => {
    const row = [
      record.registerNo,
      record.studentName,
      record.studyCentreName,
      record.studyCentreCode,
      record.semester
    ];
    // Add marks
    subjectArray.forEach(subj => {
      const match = record.subjectMarks.find(s => s.subjectName === subj);
      row.push(match ? match.mark : "");
    });
    rows.push(row);
  });

  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  xlsx.utils.book_append_sheet(workbook, worksheet, "Marks Entry");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Student_List_Marks_Entry.xlsx`
  );

  res.send(buffer);
});

exports.uploadMarks = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an excel file", 400));
  }
  const branchId = req.user.branch || req.user._id;

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

  const errors = [];

  for (let [index, row] of rows.entries()) {
    const regNo = row["Exam Reg. No."]?.toString().trim() || "";
    if (!regNo) continue;

    const record = await SupplementaryExam.findOne({
      registerNo: new RegExp(`^${regNo}$`, 'i'),
      branch: branchId
    });

    if (!record) {
      errors.push(`Row ${index + 2}: Assigned student with Reg No ${regNo} not found for your centre.`);
      continue;
    }

    // Update marks
    for (const key of Object.keys(row)) {
      const upperKey = key.trim().toUpperCase();
      const markIndex = record.subjectMarks.findIndex(s => s.subjectName === upperKey);
      if (markIndex > -1) {
        record.subjectMarks[markIndex].mark = row[key]?.toString().trim() || "";
      }
    }

    record.studyCentreSubmitted = true;
    record.centreSubmittedAt = new Date();
    await record.save();
  }

  if (errors.length > 0) {
    return res.status(400).json({ status: "fail", message: "Uploaded with some errors", errors });
  }

  res.status(200).json({
    status: "success",
    message: "Marks uploaded successfully.",
  });
});

exports.downloadFinalData = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const query = {};
  if (classId) query.class = classId;

  const records = await SupplementaryExam.find(query)
    .populate("class")
    .populate("branch")
    .sort({ createdAt: -1 });

  if (!records || records.length === 0) {
    return next(new AppError("No records found to download", 404));
  }

  // Find all subjects from these records to make columns
  let subjectColumns = new Set();
  records.forEach((r) => {
    r.subjectMarks.forEach((sm) => subjectColumns.add(sm.subjectName));
  });
  const subjectArray = Array.from(subjectColumns);

  const headers = [
    "Exam Reg. No.",
    "Student Name",
    "Study Centre Name",
    "Study Centre Code",
    "SEMESTER",
    "Status",
    ...subjectArray,
  ];

  const workbook = xlsx.utils.book_new();
  const rows = [];
  rows.push(headers);

  records.forEach((record) => {
    const row = [
      record.registerNo,
      record.studentName,
      record.studyCentreName,
      record.studyCentreCode,
      record.semester,
      record.studyCentreSubmitted ? "Completed" : "Pending",
    ];
    // Add marks
    subjectArray.forEach((subj) => {
      const match = record.subjectMarks.find((s) => s.subjectName === subj);
      row.push(match ? match.mark : "");
    });
    rows.push(row);
  });

  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  xlsx.utils.book_append_sheet(workbook, worksheet, "All Marks");

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Supplementary_Final_Data.xlsx`
  );

  res.send(buffer);
});
