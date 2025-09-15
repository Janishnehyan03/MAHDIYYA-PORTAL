const multer = require("multer");
const { protect, restrictTo } = require("../controllers/authController");
const studentController = require("../controllers/studentController");

const router = require("express").Router();

const uploads = multer();

router.post("/register", studentController.registerStudent);
router.post("/add", studentController.addStudent);

router.post("/", studentController.getAdmissions);
router.get(
  "/my-students/data/:classId",
  protect,
  restrictTo("admin"),
  studentController.getMyStudents
);
router.get(
  "/data/:studyCentreId/:classId",
  protect,
  restrictTo("superAdmin", "admin"),
  studentController.getBranchStudents
);
router.get(
  "/my-admissions/data",
  protect,
  restrictTo("admin"),
  studentController.getMyAdmissions
);
router.get("/", protect, studentController.getAllStudents);

router.get(
  "/admissions/data",
  protect,
  restrictTo("superAdmin"),
  studentController.getAllAdmissionRequests
);

router.get("/:id", studentController.getStudent);
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  studentController.deleteStudent
);
router.patch(
  "/:id",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.updateStudent
);

router.post(
  "/excel",
  protect,
  uploads.single("file"),
  studentController.excelUpload
);

router.post(
  "/drop-out",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.dropOutStudents
);

router.post(
  "/drop-out/:studentId",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.dropOutStudent
);

router.get(
  "/list/dropout",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.getDropoutList
);
router.post(
  "/promote",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.promoteStudents
);
router.post(
  "/recover",
  protect,
  restrictTo("admin", "superAdmin"),
  studentController.recoverDroppedOutStudents
);

router.delete(
  "/class/:classId",
  protect,
  restrictTo("superAdmin"),
  studentController.bulkDeleteStudentsOfClass
);

router.post(
  "/bulk-import/:classId",
  protect,
  restrictTo("superAdmin"),
  uploads.single("file"),
  studentController.bulkImportStudentsWithClassAndBranch
);

module.exports = router;
