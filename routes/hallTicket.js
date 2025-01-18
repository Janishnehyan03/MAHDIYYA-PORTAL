const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");
const HallTicket = require("../models/hallTicketModel");
const Student = require("../models/studentModel");
const Branch = require("../models/studyCentreModel");
const Class = require("../models/classModel");
const { deleteOne } = require("../utils/globalFuctions");
const SpecialHallTicket = require("../models/specialHallTicket");
const Configuration = require("../models/configurationsModel");

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


router.post("/bulk-download", protect, async (req, res) => {
  try {
    const branchId = req.user.branch; // Get the user's branch from the authenticated user
    const { class: classId } = req.body; // Get the classId from the request body
    let configuration = await Configuration.find()
    // Check if hall ticket download is enabled
    if (!configuration[0].hallTicketDownload) {
      return res.status(403).json({ message: "Hall ticket download is disabled" });
    }
    // Validate if classId is provided
    if (!classId) {
      return res.status(400).json({ message: "Class ID is required" });
    }

    // Step 1: Find all students that belong to the given class and branch
    const students = await Student.find({ class: classId, branch: branchId }).populate("class branch");

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found for this class and branch" });
    }

    // Step 3: Fetch hall ticket data for each student concurrently
    const hallTicketPromises = students.map(async (student) => {

      let hallTicket = await HallTicket.findOne({ class: classId, })
        .populate("exam")
        .populate("subjects.subjectId");


      if (!hallTicket) {
        return null; // Skip if no hall ticket found for the student
      }

      return {
        studentName: student.studentName,
        registerNo: student.registerNo,
        hallTicketDetails: hallTicket,
        institution: student.branch.studyCentreName,
        className: student.class.className,
        examName: hallTicket.exam.examName,
      };
    });

    // Wait for all promises to resolve
    const resolvedHallTickets = await Promise.all(hallTicketPromises);

    // Filter out null values (students without hall tickets)
    const validHallTickets = resolvedHallTickets.filter(ticket => ticket !== null);

    if (validHallTickets.length === 0) {
      return res.status(404).json({ message: "No hall tickets found for the given students" });
    }

    // Step 4: Send the hall ticket data as JSON
    return res.status(200).json({ hallTickets: validHallTickets });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error generating bulk download", error: error.message });
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
