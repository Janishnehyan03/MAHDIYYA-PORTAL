const router = require("express").Router();
const multer = require("multer");
const { protect, restrictTo } = require("../controllers/authController");
const {
  getResults,
  createResults,
  getMyResults,
  getGlobalResults,
  fetchToUpdate,
  updateResult,
  getExamStatistics,
} = require("../controllers/resultController");

const {
  downloadDemoExcel,
  uploadBulkResults,
  getBulkResults,
  deleteBulkResults,
  deleteSingleBulkResult,
  updateBulkResult,
  exportBulkResults,
} = require("../controllers/bulkResultController");

const uploads = multer();

// Bulk Result Routes
router.get("/bulk-demo/:classId", protect, restrictTo("superAdmin"), downloadDemoExcel);
router.post("/bulk-upload/:classId/:examId", protect, restrictTo("superAdmin"), uploads.single("file"), uploadBulkResults);
router.get("/bulk-results", protect, restrictTo("superAdmin", "admin"), getBulkResults);
router.delete("/bulk-results/:classId/:examId", protect, restrictTo("superAdmin"), deleteBulkResults);
router.delete("/bulk-results/:id", protect, restrictTo("superAdmin"), deleteSingleBulkResult);
router.patch("/bulk-results/:id", protect, restrictTo("superAdmin"), updateBulkResult);
router.get("/bulk-export", protect, restrictTo("superAdmin", "admin"), exportBulkResults);

router.post("/", protect, restrictTo("admin", "superadmin"), createResults);
router.get("/", protect, restrictTo("admin", "superAdmin"), getResults);
router.get("/data", protect, restrictTo("superAdmin"), getGlobalResults);
router.get("/:examId/:registerNo", getMyResults);
router.get("/fetch", fetchToUpdate);
router.get("/statistics", getExamStatistics);
router.patch("/", protect, restrictTo("superAdmin", "admin"), updateResult);

module.exports = router;