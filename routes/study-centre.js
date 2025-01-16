const { protect, restrictTo } = require("../controllers/authController");
const branchController = require("../controllers/studyCentreController");
const router = require("express").Router();
const multer = require("multer");

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
router.post(
  "/",
  protect,
  restrictTo("superAdmin"),
  branchController.createBranch
);
router.get("/", branchController.getAllBranches);
router.get("/:id", protect, branchController.getBranch);
router.get("/details/:id", protect, branchController.getStudyCentreDetails);
router.patch("/:id", protect, branchController.editBranch);
router.get(
  "/details/:studyCentreId",
  protect,
  branchController.getStudyCentreDetails
);
router.delete(
  "/:id",
  protect,
  restrictTo("superAdmin"),
  branchController.deleteBranch
);

router.post(
  "/:id/upload-cover/",
  protect,
  upload.single("image"),
  branchController.updateCoverImage
);
module.exports = router;
