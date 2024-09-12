const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");
const Configuration = require("../models/configurationsModel");

router.post("/", protect, restrictTo("superAdmin"), async (req, res, next) => {
  try {
    let data = await Configuration.create(req.body);
    res.status(200).json({ message: "Settings added", data });
  } catch (error) {
    next(error);
  }
});
router.get(
  "/",
  // protect,
  // restrictTo("superAdmin", "admin"),
  async (req, res, next) => {
    try {
      let data = await Configuration.find();
      res.status(200).json(data[0]);
    } catch (error) {
      next(error);
    }
  }
);
router.patch(
  "/:id",
  protect,
  restrictTo("superAdmin"),
  async (req, res, next) => {
    try {
      let data = await Configuration.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json({ message: "Settings updated", data });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
