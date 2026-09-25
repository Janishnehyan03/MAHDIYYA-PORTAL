const SupplementaryExamTemplate = require("../models/supplementaryExamTemplateModel");
const SupplementaryApplication = require("../models/supplementaryApplicationModel");
const Student = require("../models/studentModel");
const Subject = require("../models/subjectModel");
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

// 11.5 Update marks for a supplementary application
exports.updateMarks = catchAsync(async (req, res, next) => {
  const { subjectMarks } = req.body;

  const application = await SupplementaryApplication.findById(req.params.id).populate("examTemplate");
  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Check permissions (branch or superAdmin)
  if (req.user && req.user.role === "admin") {
    const isBranchMatch =
      req.user.branch &&
      application.branch &&
      application.branch.toString() === req.user.branch.toString();
    const isUserMatch =
      application.submittedBy &&
      application.submittedBy.toString() === req.user._id.toString();
    if (!isBranchMatch && !isUserMatch) {
      return next(
        new AppError("You do not have permission to update marks for this application.", 403)
      );
    }
  }

  if (subjectMarks && Array.isArray(subjectMarks)) {
    application.subjectMarks = subjectMarks;
  }

  await application.save();

  res.status(200).json({
    status: "success",
    message: "Marks updated successfully",
    data: { application },
  });
});

// 11.6 Download a ready-to-fill supplementary mark-entry workbook
exports.downloadMarksTemplate = catchAsync(async (req, res, next) => {
  const template = await SupplementaryExamTemplate.findById(req.params.templateId);
  if (!template) return next(new AppError("Exam template not found", 404));

  const query = { examTemplate: template._id };
  if (req.user?.role === "admin") {
    if (req.user.branch) query.branch = req.user.branch;
    else query.submittedBy = req.user._id;
  }

  const applications = await SupplementaryApplication.find(query).sort({ registerNo: 1 });
  const subjects = [...new Set(applications.flatMap((application) => application.subjects || []))];
  const rows = [["Register No", "Student Name", "Semester", ...subjects]];
  applications.forEach((application) => {
    const marks = new Map((application.subjectMarks || []).map((item) => [item.subjectName?.toUpperCase(), item.mark]));
    rows.push([
      application.registerNo || "",
      application.studentName || "",
      application.semester || "",
      ...subjects.map((subject) => marks.get(subject.toUpperCase()) ?? ""),
    ]);
  });

  const worksheet = xlsx.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 18 }, { wch: 28 }, { wch: 24 }, ...subjects.map(() => ({ wch: 14 }))];
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Supplementary Marks");
  const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=Supplementary_Marks_${template.title.replace(/\s+/g, "_")}.xlsx`);
  res.send(buffer);
});

// 11.7 Import supplementary marks from the template format
exports.importMarks = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("Please upload an Excel file", 400));
  const template = await SupplementaryExamTemplate.findById(req.params.templateId);
  if (!template) return next(new AppError("Exam template not found", 404));

  const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { defval: "" });
  if (!rows.length) return next(new AppError("The Excel file has no mark rows", 400));

  const applications = await SupplementaryApplication.find({ examTemplate: template._id });
  const allowed = applications.filter((application) => {
    if (req.user?.role !== "admin") return true;
    return req.user.branch
      ? application.branch?.toString() === req.user.branch.toString()
      : application.submittedBy?.toString() === req.user._id.toString();
  });
  const appMap = new Map(allowed.map((application) => [
    `${application.registerNo.toUpperCase()}|${application.semester.toUpperCase()}`,
    application,
  ]));
  const errors = [];
  const updates = new Map();
  rows.forEach((row, index) => {
    const registerNo = String(row["Register No"] || "").trim().toUpperCase();
    const semester = String(row.Semester || "").trim().toUpperCase();
    const application = appMap.get(`${registerNo}|${semester}`);
    const subjectHeaders = Object.keys(row).filter((header) => !["Register No", "Student Name", "Semester"].includes(header));
    if (!registerNo && !semester && subjectHeaders.every((subject) => row[subject] === "")) return;
    if (!application) return errors.push(`Row ${index + 2}: student/session not found`);
    const marks = updates.get(application._id.toString()) || [...(application.subjectMarks || [])].map((item) => ({ subjectName: item.subjectName, mark: item.mark }));
    for (const subject of subjectHeaders) {
      const registeredSubject = application.subjects.find((item) => item.toUpperCase() === subject.toUpperCase());
      if (!registeredSubject) {
        errors.push(`Row ${index + 2}: ${subject} is not registered for this student`);
        continue;
      }
      const rawMark = row[subject];
      const mark = rawMark === "" || rawMark === null ? "" : Number(rawMark);
      if (mark !== "" && (!Number.isFinite(mark) || mark < 0 || mark > 100)) {
        errors.push(`Row ${index + 2}: ${subject} mark must be between 0 and 100`);
        continue;
      }
      const existing = marks.find((item) => item.subjectName?.toUpperCase() === registeredSubject.toUpperCase());
      if (existing) existing.mark = mark;
      else marks.push({ subjectName: registeredSubject, mark });
    }
    updates.set(application._id.toString(), marks);
  });
  for (const [id, subjectMarks] of updates) await SupplementaryApplication.findByIdAndUpdate(id, { subjectMarks });
  res.status(200).json({ status: "success", message: `${updates.size} student records updated`, data: { updated: updates.size, errors } });
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
  const { templateId: queryTemplateId } = req.query;
  const templateId = queryTemplateId || req.params.templateId;
  const { branchId, includeMarks } = req.query;
  const query = {};
  if (templateId && templateId !== "all") {
    query.examTemplate = templateId;
  }
  if (branchId && branchId !== "all") query.branch = branchId;

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
  const markSubjects = includeMarks === "true"
    ? [...new Set(applications.flatMap((app) => app.subjects || []))]
    : [];
  const headers = [
    "Sl No",
    "Register No",
    "Student Name",
    "Study Centre Code",
    "Study Centre Name",
    ...semesterNames,
    ...(includeMarks === "true" ? ["Result Status", ...markSubjects.map((subject) => `${subject} Mark`)] : []),
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

      if (includeMarks === "true") {
        const markMap = new Map((app.subjectMarks || []).map((item) => [item.subjectName?.trim().toUpperCase(), item.mark]));
        const complete = markSubjects.every((subject) => {
          const mark = markMap.get(subject.trim().toUpperCase());
          return mark !== "" && mark !== null && mark !== undefined;
        });
        const passed = complete && markSubjects.every((subject) => Number(markMap.get(subject.trim().toUpperCase())) >= 40);
        row.push(!complete ? "Pending" : passed ? "Pass" : "Fail");
        markSubjects.forEach((subject) => row.push(markMap.get(subject.trim().toUpperCase()) ?? ""));
      }

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

// ==========================================
// SUPPLEMENTARY HALL TICKETS
// ==========================================

// 14. Get Hall Ticket Sessions and Semesters Summary (for Study Centre)
exports.getSupplementaryHallTicketSessions = catchAsync(async (req, res, next) => {
  const query = {};
  if (req.user && req.user.role === "admin") {
    if (req.user.branch) {
      query.branch = req.user.branch;
    } else {
      query.submittedBy = req.user._id;
    }
  }

  // Find all applications submitted by this centre
  const applications = await SupplementaryApplication.find(query)
    .populate("examTemplate", "title status")
    .sort({ createdAt: -1 });

  // Group by Exam Template and Semester
  const sessionMap = {};

  applications.forEach((app) => {
    if (!app.examTemplate) return;
    const templateId = app.examTemplate._id.toString();
    if (!sessionMap[templateId]) {
      sessionMap[templateId] = {
        _id: templateId,
        title: app.examTemplate.title,
        status: app.examTemplate.status,
        totalStudents: 0,
        semesters: {},
      };
    }

    sessionMap[templateId].totalStudents += 1;
    const semName = (app.semester || "General").trim();
    if (!sessionMap[templateId].semesters[semName]) {
      sessionMap[templateId].semesters[semName] = 0;
    }
    sessionMap[templateId].semesters[semName] += 1;
  });

  const sessions = Object.values(sessionMap).map((session) => ({
    _id: session._id,
    title: session.title,
    status: session.status,
    totalStudents: session.totalStudents,
    semesters: Object.entries(session.semesters).map(([semesterName, count]) => ({
      semesterName,
      count,
    })),
  }));

  res.status(200).json({
    status: "success",
    data: { sessions },
  });
});

// 15. Get Supplementary Hall Tickets Data for Bulk Download
exports.getSupplementaryHallTickets = catchAsync(async (req, res, next) => {
  const { examTemplateId, semester } = req.query;
  const query = {};

  if (req.user && req.user.role === "admin") {
    if (req.user.branch) {
      query.branch = req.user.branch;
    } else {
      query.submittedBy = req.user._id;
    }
  }

  if (examTemplateId && examTemplateId !== "all") {
    query.examTemplate = examTemplateId;
  }

  if (semester && semester !== "all") {
    query.semester = semester;
  }

  const applications = await SupplementaryApplication.find(query)
    .populate("examTemplate", "title status")
    .populate("branch", "studyCentreName studyCentreCode")
    .sort({ registerNo: 1 });

  if (!applications || applications.length === 0) {
    return res.status(200).json({
      status: "success",
      data: { hallTickets: [] },
      message: "No supplementary applications found",
    });
  }

  // Collect register numbers to fetch photos
  const regNos = applications
    .map((a) => a.registerNo?.trim().toUpperCase())
    .filter(Boolean);
  const students = await Student.find({
    registerNo: { $in: regNos.map((r) => new RegExp(`^${r}$`, "i")) },
  }).select("registerNo imageUrl");

  const studentPhotoMap = {};
  students.forEach((s) => {
    if (s.registerNo && s.imageUrl) {
      studentPhotoMap[s.registerNo.trim().toUpperCase()] = s.imageUrl;
    }
  });

  // Fetch subjects to map codes if available
  const allSubjects = await Subject.find().select("subjectName subjectCode");
  const subjectCodeMap = {};
  allSubjects.forEach((sub) => {
    if (sub.subjectName && sub.subjectCode) {
      subjectCodeMap[sub.subjectName.trim().toUpperCase()] = sub.subjectCode;
    }
  });

  const hallTickets = applications.map((app) => {
    const regNoUpper = (app.registerNo || "").trim().toUpperCase();
    const photo = studentPhotoMap[regNoUpper] || null;

    const subjectsList = Array.isArray(app.subjects) ? app.subjects : [];
    const formattedSubjects = subjectsList.map((subj) => {
      const sName = (subj || "").trim();
      return {
        subjectName: sName,
        subjectCode: subjectCodeMap[sName.toUpperCase()] || "-",
        date: "-",
        time: "-",
      };
    });

    const institution =
      app.studyCentreName ||
      app.branch?.studyCentreName ||
      (req.user?.branch ? req.user.branch.studyCentreName : "") ||
      "MAHDIYYAH STUDY CENTRE";

    const examTitle = app.examTemplate?.title
      ? `${app.examTemplate.title}`
      : "SUPPLEMENTARY EXAMINATION";

    return {
      _id: app._id,
      registerNo: app.registerNo,
      studentName: app.studentName,
      institution: institution.toUpperCase(),
      className: (app.semester || "SUPPLEMENTARY").toUpperCase(),
      semester: app.semester,
      examName: examTitle,
      examTemplateId: app.examTemplate?._id,
      imageUrl: photo,
      subjects: formattedSubjects,
      isManualStudent: app.isManualStudent,
    };
  });

  res.status(200).json({
    status: "success",
    data: { hallTickets },
  });
});
