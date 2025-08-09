const {
  createTeacher,
  getAllTeachers,
  updateTeacher,
  deleteTeacher,
  getOneTeacher,
} = require("../controllers/teacherController");
const { protect } = require("../controllers/authController");

const router = require("express").Router();

router.route("/").post(createTeacher).get(protect, getAllTeachers);

router.route("/:id").patch(protect, updateTeacher).get(protect, getOneTeacher);
router.route("/:id").delete(protect, deleteTeacher);
// .get(protect, getMyTeachers)

module.exports = router;
