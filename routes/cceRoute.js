const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");
const {
  getResults,
  createResults,
  getMyResults,
  getGlobalResults,
  fetchToUpdate,
  updateResult,
  getExamStatistics,
} = require("../controllers/cceController");

router.post("/", protect, restrictTo("admin", "superAdmin"), createResults);
router.get("/", protect, restrictTo("admin", "superAdmin"), getResults);
router.get("/data", protect, restrictTo("superAdmin"), getGlobalResults);
router.get("/:examId/:registerNo", getMyResults);
router.get("/fetch", fetchToUpdate);
router.get("/statistics", getExamStatistics);
router.patch("/", updateResult);
module.exports = router;
