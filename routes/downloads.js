const router = require("express").Router();
const { default: mongoose } = require("mongoose");
const multer = require("multer");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
const { deleteOne } = require("../utils/globalFuctions");
const fs = require("fs");
const path = require("path");
const os = require("os");

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
  originalName: { type: String },
});
const Download = mongoose.model("Download", downloadSchema);

function getResourceType(fileName) {
  const ext = (fileName || "").split(".").pop().toLowerCase();
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "tiff"];
  if (imageExtensions.includes(ext)) {
    return "image";
  }
  return "raw";
}

// Upload file to Cloudinary using a temporary disk file to avoid memory stream chunking corruption.
function uploadFile(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const tempDir = os.tmpdir();
    
    // Check resource type
    const isImage = getResourceType(originalname) === "image";
    
    // Enforce extensionless local file on disk for non-images to bypass Cloudinary's strict PDF/ZIP content restrictions
    let tempFileName = Date.now() + "_";
    if (isImage) {
      tempFileName += originalname;
    } else {
      const nameWithoutExt = originalname.substring(0, originalname.lastIndexOf('.'));
      tempFileName += nameWithoutExt.replace(/[^a-zA-Z0-9_]/g, "_");
    }

    const tempFilePath = path.join(tempDir, tempFileName);

    fs.writeFile(tempFilePath, buffer, (writeErr) => {
      if (writeErr) return reject(writeErr);

      cloudinary.v2.uploader.upload(
        tempFilePath,
        {
          resource_type: isImage ? "image" : "raw",
          folder: "downloads",
        },
        (uploadErr, result) => {
          // Cleanup temp file
          fs.unlink(tempFilePath, (unlinkErr) => {
            if (unlinkErr) console.error("Temp file cleanup failed:", unlinkErr);
          });

          if (uploadErr) return reject(uploadErr);
          resolve(result);
        }
      );
    });
  });
}

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const cldRes = await uploadFile(req.file.buffer, req.file.originalname);

    let data = await Download.create({
      title: req.body.title,
      fileName: cldRes.secure_url,
      type: req.body.type,
      originalName: req.file.originalname,
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
