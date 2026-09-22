const SupplementaryExamTemplate = require("../models/supplementaryExamTemplateModel");
const SupplementaryApplication = require("../models/supplementaryApplicationModel");
const Student = require("../models/studentModel");
const Branch = require("../models/studyCentreModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const xlsx = require("xlsx");

// ==========================================
// SUPER ADMIN: EXAM TEMPLATE MANAGEMENT
// ==========================================

// 1. Create a new Supplementary Exam Template
exports.createTemplate = catchAsync(async (req, res, next) => {
  const { title, semesters } = req.body;

  if (!title || !title.trim()) {
    return next(new AppError("Exam title is required", 400));
  }

  if (!semesters || !Array.isArray(semesters) || semesters.length === 0) {
    return next(new AppError("At least one semester with subjects is required", 400));
  }

  const newTemplate = await SupplementaryExamTemplate.create({
    title: title.trim(),
    semesters,
    createdBy: req.user?._id,
    status: "open",
  });

  res.status(201).json({
    status: "success",
    message: "Supplementary Exam Template created successfully",
    data: { template: newTemplate },
  });
});

// 2. Get all Exam Templates (for Super Admin)
exports.getTemplates = catchAsync(async (req, res, next) => {
  const templates = await SupplementaryExamTemplate.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { templates },
  });
});

// 3. Get only OPEN Exam Templates (for Study Centre Admin)
exports.getOpenTemplates = catchAsync(async (req, res, next) => {
  const templates = await SupplementaryExamTemplate.find({ status: "open" }).sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { templates },
  });
});

// 4. Get specific Exam Template by ID
exports.getTemplateById = catchAsync(async (req, res, next) => {
  const template = await SupplementaryExamTemplate.findById(req.params.id);
  if (!template) {
    return next(new AppError("Exam template not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { template },
  });
});

// 5. Update Exam Template
exports.updateTemplate = catchAsync(async (req, res, next) => {
  const { title, semesters } = req.body;

  const template = await SupplementaryExamTemplate.findById(req.params.id);
  if (!template) {
    return next(new AppError("Exam template not found", 404));
  }

  if (title) template.title = title.trim();
  if (semesters && Array.isArray(semesters)) template.semesters = semesters;

  await template.save();

  res.status(200).json({
    status: "success",
    message: "Exam template updated successfully",
    data: { template },
  });
});

// 6. Toggle Open/Close Status
exports.toggleTemplateStatus = catchAsync(async (req, res, next) => {
  const template = await SupplementaryExamTemplate.findById(req.params.id);
  if (!template) {
    return next(new AppError("Exam template not found", 404));
  }

  template.status = template.status === "open" ? "closed" : "open";
  await template.save();

  res.status(200).json({
    status: "success",
    message: `Supplementary Exam template status changed to ${template.status.toUpperCase()}`,
    data: { template },
  });
});

// 7. Delete Exam Template (Soft Delete)
exports.deleteTemplate = catchAsync(async (req, res, next) => {
  const template = await SupplementaryExamTemplate.findById(req.params.id);
  if (!template) {
    return next(new AppError("Exam template not found", 404));
  }

  template.deleted = true;
  await template.save();

  res.status(200).json({
    status: "success",
    message: "Exam template deleted successfully",
  });
});

// ==========================================
// STUDY CENTRE ADMIN: APPLICATIONS & STUDENT LOOKUP
// ==========================================

// 8. Search Student details by Register Number in DB
exports.searchStudentByRegNo = catchAsync(async (req, res, next) => {
  const { regNo } = req.params;
  if (!regNo) {
    return next(new AppError("Register number is required", 400));
  }

  const cleanRegNo = regNo.trim();
  const student = await Student.findOne({
    registerNo: new RegExp(`^${cleanRegNo}$`, "i"),
  }).populate("branch");

  if (!student) {
    return res.status(200).json({
      status: "success",
      found: false,
      message: "Student not found in database",
    });
  }

  res.status(200).json({
    status: "success",
    found: true,
    data: {
      registerNo: student.registerNo,
      studentName: student.studentName,
      branchId: student.branch?._id || null,
      studyCentreName: student.branch?.studyCentreName || "",
      studyCentreCode: student.branch?.studyCentreCode || "",
    },
  });
});

// 9. Submit Supplementary Application
exports.submitApplication = catchAsync(async (req, res, next) => {
  const {
    examTemplateId,
    registerNo,
    studentName,
    semester,
    subjects,
    isManualStudent,
    studyCentreName,
    studyCentreCode,
  } = req.body;

  if (!examTemplateId) {
    return next(new AppError("Exam template selection is required", 400));
  }

  const template = await SupplementaryExamTemplate.findById(examTemplateId);
  if (!template) {
    return next(new AppError("Exam template not found", 404));
  }

  if (template.status !== "open") {
    return next(new AppError("This supplementary exam is currently closed for submission.", 400));
  }

  if (!registerNo || !registerNo.trim()) {
    return next(new AppError("Register number is required", 400));
  }

  if (!studentName || !studentName.trim()) {
    return next(new AppError("Student name is required", 400));
  }

  if (!semester) {
    return next(new AppError("Semester selection is required", 400));
  }

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return next(new AppError("At least one subject must be selected for supplementary", 400));
  }

  // Determine Branch / Study Centre details
  let userBranch = null;
  let finalCentreName = studyCentreName || "";
  let finalCentreCode = studyCentreCode || "";

  if (req.user && req.user.branch) {
    const branchDoc = await Branch.findById(req.user.branch);
    if (branchDoc) {
      userBranch = branchDoc._id;
      finalCentreName = branchDoc.studyCentreName;
      finalCentreCode = branchDoc.studyCentreCode;
    }
  }

  // Create Supplementary Application (store real values as strings)
  const application = await SupplementaryApplication.create({
    examTemplate: examTemplateId,
    registerNo: registerNo.trim().toUpperCase(),
    studentName: studentName.trim().toUpperCase(),
    branch: userBranch,
    studyCentreName: finalCentreName.toUpperCase(),
    studyCentreCode: finalCentreCode.toUpperCase(),
    semester: semester.trim(),
    subjects: subjects.map((s) => s.trim().toUpperCase()),
    isManualStudent: !!isManualStudent,
    submittedBy: req.user?._id,
  });

  res.status(201).json({
    status: "success",
    message: "Supplementary application submitted successfully",
    data: { application },
  });
});

// 10. Get Study Centre Submitted Applications
exports.getAdminApplications = catchAsync(async (req, res, next) => {
  const { examTemplateId } = req.query;
  const query = {};

  if (req.user && req.user.branch) {
    query.branch = req.user.branch;
  } else if (req.user) {
    query.submittedBy = req.user._id;
  }

  if (examTemplateId) {
    query.examTemplate = examTemplateId;
  }

  const applications = await SupplementaryApplication.find(query)
    .populate("examTemplate", "title status")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { applications },
  });
});

// 11. Delete/Cancel Application
exports.deleteApplication = catchAsync(async (req, res, next) => {
  const application = await SupplementaryApplication.findById(req.params.id).populate("examTemplate");
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Prevent study centre admins from deleting applications if the exam session is closed
  if (req.user && req.user.role === "admin") {
    if (application.examTemplate && application.examTemplate.status === "closed") {
      return next(
        new AppError(
          "Cannot delete applications after the supplementary exam window is closed.",
          400
        )
      );
    }
    const isBranchMatch =
      req.user.branch &&
      application.branch &&
      application.branch.toString() === req.user.branch.toString();
    const isUserMatch =
      application.submittedBy &&
      application.submittedBy.toString() === req.user._id.toString();
    if (!isBranchMatch && !isUserMatch) {
      return next(
        new AppError(
          "You do not have permission to delete this application.",
          403
        )
      );
    }
  }

  application.deleted = true;
  await application.save();

  res.status(200).json({
    status: "success",
    message: "Application deleted successfully",
  });
});

// ==========================================
// SUPER ADMIN & STUDY CENTRE: VIEW SUBMISSIONS & EXCEL EXPORT
// ==========================================

// 12. Get Super Admin Submissions for Exam Template
exports.getSuperAdminApplications = catchAsync(async (req, res, next) => {
  const { examTemplateId } = req.query;
  const query = {};
  if (examTemplateId) {
    query.examTemplate = examTemplateId;
  }

  const applications = await SupplementaryApplication.find(query)
    .populate("examTemplate", "title status")
    .populate("branch", "studyCentreName studyCentreCode")
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    data: { applications },
  });
});

// 13. Export Submitted Applications to Excel (Semester names as headers, multiple student rows for multiple subjects)
exports.exportApplicationsExcel = catchAsync(async (req, res, next) => {
  const { templateId } = req.params;
  const query = {};
  if (templateId && templateId !== "all") {
    query.examTemplate = templateId;
  }

  // If study centre admin, restrict export to their study centre
  if (req.user && req.user.role === "admin") {
    if (req.user.branch) {
      query.branch = req.user.branch;
    } else {
      query.submittedBy = req.user._id;
    }
  }

  const templateDoc =
    templateId && templateId !== "all"
      ? await SupplementaryExamTemplate.findById(templateId)
      : null;

  const applications = await SupplementaryApplication.find(query)
    .populate("examTemplate", "title")
    .sort({ createdAt: -1 });

  if (!applications || applications.length === 0) {
    return next(new AppError("No submitted applications found to export", 404));
  }

  // Collect all unique semester names to use as column headers
  const semesterSet = new Set();

  if (templateDoc && templateDoc.semesters) {
    templateDoc.semesters.forEach((s) => {
      if (s.semesterName) semesterSet.add(s.semesterName.trim());
    });
  }

  // Also gather any semesters from actual application entries
  applications.forEach((app) => {
    if (app.semester) semesterSet.add(app.semester.trim());
  });

  const semesterNames = Array.from(semesterSet);

  // Build Headers: Sl No, Register No, Student Name, Study Centre Code, Study Centre Name, [Semester 1], [Semester 2] ...
  const headers = [
    "Sl No",
    "Register No",
    "Student Name",
    "Study Centre Code",
    "Study Centre Name",
    ...semesterNames,
  ];

  const rows = [headers];
  let slNo = 1;

  applications.forEach((app) => {
    const subjects =
      Array.isArray(app.subjects) && app.subjects.length > 0
        ? app.subjects
        : [""];

    subjects.forEach((subj) => {
      const row = [
        slNo++,
        app.registerNo || "",
        app.studentName || "",
        app.studyCentreCode || "",
        app.studyCentreName || "",
      ];

      // For each semester header column, put the subject name if it matches app.semester, else empty cell
      semesterNames.forEach((semName) => {
        if (
          app.semester &&
          semName.toUpperCase() === app.semester.trim().toUpperCase()
        ) {
          row.push(subj);
        } else {
          row.push("");
        }
      });

      rows.push(row);
    });
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(rows);

  // Column width styling
  const colWidths = [
    { wch: 8 },  // Sl No
    { wch: 16 }, // Reg No
    { wch: 25 }, // Student Name
    { wch: 18 }, // Centre Code
    { wch: 28 }, // Centre Name
  ];
  semesterNames.forEach(() => {
    colWidths.push({ wch: 25 });
  });
  worksheet["!cols"] = colWidths;

  const sheetName = templateDoc
    ? templateDoc.title.substring(0, 30).replace(/[:\/?*\[\]]/g, "_")
    : "Supplementary Applications";

  xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  const fileName = templateDoc
    ? `Supplementary_Applications_${templateDoc.title.replace(/\s+/g, "_")}.xlsx`
    : `Supplementary_Applications_All.xlsx`;

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

  res.send(buffer);
});

