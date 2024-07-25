const {
  createTeacher,
  getAllTeachers,
  updateTeacher,
  getOneTeacher,
} = require("../controllers/teacherController");
const { protect, restrictTo } = require("../controllers/authController");

const router = require("express").Router();

router.route("/").post(createTeacher).get(protect, getAllTeachers);

router
  .route("/:id")
  .patch(protect, updateTeacher)
  .get(protect, getOneTeacher);
  // .get(protect, getMyTeachers)

module.exports = router;
