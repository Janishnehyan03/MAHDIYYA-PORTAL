const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");
const HallTicket = require("../models/hallTicketModel");
const Student = require("../models/studentModel");
const Branch = require("../models/studyCentreModel");
const Class = require("../models/classModel");
const { deleteOne } = require("../utils/globalFuctions");
const SpecialHallTicket = require("../models/specialHallTicket");

router.post("/", protect, restrictTo("superAdmin"), async (req, res) => {
  try {
    let data = await HallTicket.create(req.body);
    res.status(200).json(data);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
});
router.patch("/:id", protect, restrictTo("superAdmin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Find the hall ticket by ID and update it
    const updatedHallTicket = await HallTicket.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedHallTicket) {
      return res.status(404).json({ message: "Hall ticket not found" });
    }

    res.status(200).json(updatedHallTicket);
  } catch (error) {
    console.error("Error updating hall ticket:", error);
    res
      .status(400)
      .json({ message: "Error updating hall ticket", error: error.message });
  }
});
router.get("/", async (req, res) => {
  try {
    let data = await HallTicket.find()
      .populate("exam")
      .populate("class")
      .populate("subjects.subjectId");
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});
router.get("/:id", async (req, res) => {
  try {
    let data = await HallTicket.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});
router.delete("/:id", deleteOne(HallTicket));
router.post("/download", async (req, res) => {
  try {
    const student = await Student.findOne({
      registerNo: req.body.registerNo,
    });
    if (!student) {
      return res.status(400).json({ message: "Invalid Register Number" });
    }

    const branch = await Branch.findById(student.branch);

    const classData = await Class.findOne({ _id: student.class });

    let hallTicket = await HallTicket.findOne({ class: classData._id })
      .populate("exam")
      .populate("subjects.subjectId");


    const studentsWithBranchAndClassName = {
      ...student._doc,
      studyCentreName: branch ? branch.studyCentreName : null,
      className: classData ? classData.className : null,
    };

    return res
      .status(200)
      .json({ ...hallTicket._doc, data: studentsWithBranchAndClassName });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
router.get("/special-hallticket/:registerNumber", async (req, res) => {
  try {
    const students = await SpecialHallTicket.find({
      registerNo: req.params.registerNumber,
    });

    if (!students.length > 0) {
      return res.status(404).send("Student not found");
    }
    // Assuming all students with the same registerNo have the same name and institution
    const record = students[0]; // You can take the first record as a base

    // Consolidate semester information
    const semesters = {
      secondSem: "",
      forthSem: "",
      mahdiyyaSecondSem: "",
      mahdiyyaForthSem: "",
      mahdiyyaSixthSem: "",
    };

    students.forEach((record) => {
      if (record?.secondSem) semesters.secondSem = record?.secondSem;
      if (record?.forthSem) semesters.forthSem = record?.forthSem;
      if (record?.mahdiyyaSecondSem)
        semesters.mahdiyyaSecondSem = record?.mahdiyyaSecondSem;
      if (record?.mahdiyyaForthSem)
        semesters.mahdiyyaForthSem = record?.mahdiyyaForthSem;
      if (record?.mahdiyyaSixthSem)
        semesters.mahdiyyaSixthSem = record?.mahdiyyaSixthSem;
    });

    const response = {
      name: record?.name,
      registerNo: record?.registerNo,
      institution: record?.institution,
      examCentre: students[0]?.examCentre || students[1]?.examCentre,
      semester: record?.semester,
      method: record?.method,
      semesters: semesters,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
});

module.exports = router;
