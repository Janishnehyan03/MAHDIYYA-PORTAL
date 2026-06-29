const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const { Readable } = require("stream");
const dotenv = require("dotenv");
const { deleteOne } = require("../utils/globalFuctions");

dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max upload size
});

const downloadSchema = new mongoose.Schema({
  fileName: { type: String, required: [true, "File is required"] },
  title: { type: String, required: [true, '"download" title is required'] },
  type: { type: String, required: true, enum: ["student", "admin"] },
});
const Download = mongoose.model("Download", downloadSchema);

// Chunked upload bypasses Cloudinary's 10MB limit on the regular upload endpoint.
function uploadFile(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_chunked_stream(
      { resource_type: "auto", chunk_size: 6 * 1024 * 1024 },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}
router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const cldRes = await uploadFile(req.file.buffer);

    let data = await Download.create({
      title: req.body.title,
      fileName: cldRes.secure_url,
      type: req.body.type,
    });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    let data = await Download.find();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});
router.get("/student", async (req, res, next) => {
  try {
    let data = await Download.find({ type: "student" });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    let data = await Download.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", deleteOne(Download));

module.exports = router;
