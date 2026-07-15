const router = require("express").Router();
const mongoose = require("mongoose");
const { protect } = require("../controllers/authController");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { deleteOne } = require("../utils/globalFuctions");

const uploadSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Branch",
    },
    referenceId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Download",
    },
    remarks: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Upload = mongoose.model("Upload", uploadSchema);

const uploadsDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});
const uploads = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
}).single("file");

router.post("/", protect, (req, res, next) => {
  uploads(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size exceeds the 50 MB limit." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(500).json({ message: "An unknown error occurred during upload." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Please select a file to upload." });
    }

    try {
      let data = await Upload.create({
        fileName: req.file.filename,
        uploadedBy: req.user.branch,
        referenceId: req.body.referenceId,
      });
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  });
});

router.get("/:referenceId", protect, async (req, res, next) => {
  try {
    let data = await Upload.find({
      referenceId: req.params.referenceId,
    })
      .populate("uploadedBy", "studyCentreName studyCentreCode")
      .populate("referenceId")
      .sort({ createdAt: -1 });

    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/", protect, async (req, res, next) => {
  try {
    let data = await Upload.find({ uploadedBy: req.user.branch }).populate(
      "referenceId",
      "title"
    );
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/:id", deleteOne(Upload));

module.exports = router;
