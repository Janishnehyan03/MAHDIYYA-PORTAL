const {
  signUp,
  signIn,
  logout,
  checkUserLoggedIn,
  createUser,
  restrictTo,
  protect,
  getAllUsers,
  getUser,
  createMultiUsers,
  getMyProfile,
  updatePassword,
  getStudyCentresCredentials,
  revealStudyCentrePassword,
  adminResetCentrePassword,
} = require("../controllers/authController");

const router = require("express").Router();

router.post("/register", signUp);
router.post("/create-user", protect, restrictTo("superAdmin"), createUser);
router.post("/multi-user", protect, restrictTo("superAdmin"), createMultiUsers);
router.get("/users", protect, restrictTo("superAdmin"), getAllUsers);
router.get("/user/:id", protect, restrictTo("superAdmin"), getUser);
router.patch("/password", protect, updatePassword);
router.patch("/password/:id", protect, updatePassword);

// Study Centre Credentials (Super Admin)
router.get("/study-centres-credentials", protect, restrictTo("superAdmin"), getStudyCentresCredentials);
router.post("/reveal-study-centre-password", protect, restrictTo("superAdmin"), revealStudyCentrePassword);
router.patch("/reset-centre-password/:centreId", protect, restrictTo("superAdmin"), adminResetCentrePassword);

router.post("/login", signIn);
router.post("/logout", logout);
router.post("/checkLogin", checkUserLoggedIn);
router.get("/profile", protect, getMyProfile);

module.exports = router;
