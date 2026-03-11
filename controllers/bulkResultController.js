const mongoose = require("mongoose");
const xlsx = require("xlsx");
const BulkResult = require("../models/bulkResultModel");
const Student = require("../models/studentModel");
const Subject = require("../models/subjectModel");
const Class = require("../models/classModel");
const Exam = require("../models/examModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.downloadDemoExcel = catchAsync(async (req, res, next) => {
    const { classId } = req.params;
    const cls = await Class.findById(classId);
    if (!cls) return next(new AppError("Class not found", 404));

    const subjects = await Subject.find({ class: classId, deleted: { $ne: true } });

    // Row 1: Main categories
    const row1 = ["#", "Reg No", "Student Name"];
    subjects.forEach(sub => {
        const label = `${sub.subjectName} (${sub.subjectCode})`;
        row1.push(label, "", "", "", ""); // 5 columns for each subject
    });
    row1.push("Failed", "Sem Status", "G.Total", "%", "Class");

    // Row 2: Sub-headers
    const row2 = ["", "", ""];
    subjects.forEach(() => {
        row2.push("FA", "SA", "10%", "TL", "Status");
    });
    row2.push("", "", "", "", "");

    const aoa = [row1, row2];
    const ws = xlsx.utils.aoa_to_sheet(aoa);

    // Merge cells for subjects
    const merges = [];
    let startCol = 3; // Starting from index 3 (after #, Reg No, Student Name)
    subjects.forEach(() => {
        merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 4 } });
        startCol += 5;
    });
    ws["!merges"] = merges;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Bulk Mark Entry");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=Bulk_Mark_Entry_${cls.className}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
});

exports.uploadBulkResults = catchAsync(async (req, res, next) => {
    const { classId, examId } = req.params;
    if (!req.file) return next(new AppError("Please upload an excel file", 400));

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const aoa = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (aoa.length < 3) return next(new AppError("Excel file is empty or invalid format", 400));

    const headerRow1 = aoa[0];
    const dataRows = aoa.slice(2);

    const subjects = await Subject.find({ class: classId, deleted: { $ne: true } });
    const subjectMap = {};
    subjects.forEach(s => {
        subjectMap[`${s.subjectName} (${s.subjectCode})`] = s._id;
    });

    const resultsToSave = [];

    for (const row of dataRows) {
        // Index 0 is #, Index 1 is Reg No
        const registerNo = row[1]?.toString().trim();
        if (!registerNo) continue;

        const student = await Student.findOne({ registerNo, class: classId });
        if (!student) continue;

        // subjects start at index 3
        const subjectStartIndex = 3;
        const subjectEndIndex = subjectStartIndex + (subjects.length * 5);

        const bulkResult = {
            student: student._id,
            class: classId,
            exam: examId,
            marks: [],
            className: row[subjectEndIndex + 4] || "",
            percentage: row[subjectEndIndex + 3] || "",
            gTotal: row[subjectEndIndex + 2] || "",
            semStatus: row[subjectEndIndex + 1] || "",
            noOfFailed: row[subjectEndIndex] || "",
        };

        // Process subjects
        for (let i = subjectStartIndex; i < subjectEndIndex; i += 5) {
            const subjectLabel = headerRow1[i];
            const subjectId = subjectMap[subjectLabel];
            if (!subjectId) continue;

            bulkResult.marks.push({
                subject: subjectId,
                fa: row[i] || "",
                sa: row[i + 1] || "",
                tenPercent: row[i + 2] || "",
                tl: row[i + 3] || "",
                status: row[i + 4] || "",
            });
        }

        resultsToSave.push({
            updateOne: {
                filter: { student: student._id, class: classId, exam: examId },
                update: { $set: bulkResult },
                upsert: true
            }
        });
    }

    if (resultsToSave.length > 0) {
        await BulkResult.bulkWrite(resultsToSave);
    }

    res.status(200).json({ status: "success", message: `${resultsToSave.length} records processed` });
});

exports.getBulkResults = catchAsync(async (req, res, next) => {
    const { classId, examId, studyCentreId } = req.query;

    let query = { class: classId, exam: examId };

    // If search is for a specific branch (Admin view)
    // We need to filter BulkResult by student's branch

    let data = await BulkResult.find(query)
        .populate({
            path: "student",
            match: studyCentreId ? { branch: studyCentreId } : {},
            populate: { path: "branch" }
        })
        .populate("marks.subject");

    // Filter out any results where student didn't match branch (if branch was provided)
    data = data.filter(d => d.student !== null);

    res.status(200).json(data);
});

exports.deleteBulkResults = catchAsync(async (req, res, next) => {
    const { classId, examId } = req.params;
    await BulkResult.deleteMany({ class: classId, exam: examId });
    res.status(200).json({ status: "success", message: "All results for this class and exam have been deleted" });
});

exports.deleteSingleBulkResult = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await BulkResult.findByIdAndDelete(id);
    if (!result) return next(new AppError("Result not found", 404));
    res.status(200).json({ status: "success", message: "Result deleted successfully" });
});

exports.updateBulkResult = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await BulkResult.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
    });
    if (!result) return next(new AppError("Result not found", 404));
    res.status(200).json({ status: "success", data: result });
});

exports.exportBulkResults = catchAsync(async (req, res, next) => {
    const { classId, examId, studyCentreId } = req.query;
    const cls = await Class.findById(classId);
    const exam = await Exam.findById(examId);
    if (!cls || !exam) return next(new AppError("Class or Exam not found", 404));

    const subjects = await Subject.find({ class: classId, deleted: { $ne: true } });
    let query = { class: classId, exam: examId };

    let results = await BulkResult.find(query)
        .populate({
            path: "student",
            match: studyCentreId ? { branch: studyCentreId } : {},
            populate: { path: "branch" }
        })
        .populate("marks.subject");

    results = results.filter(d => d.student !== null);

    // Row 1: Header
    const row1 = ["#", "Reg No", "Student Name"];
    subjects.forEach(sub => {
        row1.push(`${sub.subjectName} (${sub.subjectCode})`, "", "", "", "");
    });
    row1.push("Failed", "Sem Status", "G.Total", "%", "Class");

    // Row 2: Sub-headers
    const row2 = ["", "", ""];
    subjects.forEach(() => {
        row2.push("FA", "SA", "10%", "TL", "Status");
    });
    row2.push("", "", "", "", "");

    const dataRows = results.map((res, index) => {
        const row = [index + 1, res.student?.registerNo, res.student?.studentName];
        subjects.forEach(sub => {
            const mark = res.marks.find(m => m.subject?._id.toString() === sub._id.toString()) || {};
            row.push(mark.fa || "", mark.sa || "", mark.tenPercent || "", mark.tl || "", mark.status || "");
        });
        row.push(res.noOfFailed || "0", res.semStatus || "", res.gTotal || "0", res.percentage ? `${Number(res.percentage).toFixed(2)} %` : "0 %", res.className || "");
        return row;
    });

    const aoa = [row1, row2, ...dataRows];
    const ws = xlsx.utils.aoa_to_sheet(aoa);

    // Merges
    const merges = [];
    let startCol = 3;
    subjects.forEach(() => {
        merges.push({ s: { r: 0, c: startCol }, e: { r: 0, c: startCol + 4 } });
        startCol += 5;
    });
    ws["!merges"] = merges;

    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Results");

    const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", `attachment; filename=Results_${cls.className}_${exam.examName}.xlsx`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
});
