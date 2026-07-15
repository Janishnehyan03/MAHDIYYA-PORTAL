const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Resource = require("../models/resourceModel");
const { protect, restrictTo } = require("../controllers/authController");
const fs = require("fs");
const path = require("path");
const os = require("os");

// --- Small logging helper so every line is tagged + easy to grep ---
const log = (...args) => console.log("[resources]", ...args);

// Sanity-check Cloudinary credentials once at startup. Missing/blank values
// make uploads hang or fail with a confusing 401, so surface it loudly here.
(() => {
  const cfg = cloudinary.config();
  log("Cloudinary config at startup:", {
    cloud_name: cfg.cloud_name || "MISSING",
    api_key: cfg.api_key ? "set" : "MISSING",
    api_secret: cfg.api_secret ? "set" : "MISSING",
  });
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    log("WARNING: Cloudinary is not fully configured — uploads will fail.");
  }
})();

const upload = multer({
  storage: new multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

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
    const startedAt = Date.now();
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
      if (writeErr) {
        log("Temp file write FAILED:", writeErr);
        return reject(writeErr);
      }

      cloudinary.uploader.upload(
        tempFilePath,
        {
          resource_type: isImage ? "image" : "raw",
          folder: "resources",
        },
        (uploadErr, result) => {
          // Cleanup temp file
          fs.unlink(tempFilePath, (unlinkErr) => {
            if (unlinkErr) log("Temp file cleanup failed:", unlinkErr);
          });

          if (uploadErr) {
            log("Cloudinary upload FAILED after", Date.now() - startedAt, "ms:", uploadErr);
            return reject(uploadErr);
          }

          log(
            "Cloudinary upload OK in",
            Date.now() - startedAt,
            "ms |",
            result.bytes,
            "bytes |",
            result.secure_url
          );
          resolve(result);
        }
      );
    });
  });
}

// Normalise the allowedUsers field coming from multipart/form-data.
// It may arrive as a JSON string, a repeated field (array) or be absent.
function parseAllowedUsers(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [raw];
  }
}

// Create a new download (super admin only)
router.post(
  "/",
  protect,
  restrictTo("superAdmin"),
  upload.single("file"),
  async (req, res, next) => {
    const t0 = Date.now();
    try {
      log("POST /resources received from user:", req.user?._id, "role:", req.user?.role);

      if (!req.file) {
        log("No file on request. body keys:", Object.keys(req.body || {}));
        return res.status(400).json({ message: "Please select a file to upload." });
      }

      log("File received:", {
        name: req.file.originalname,
        sizeKB: (req.file.size / 1024).toFixed(1),
        mimetype: req.file.mimetype,
        title: req.body.title,
        audience: req.body.audience,
      });

      log("Step 1: uploading to Cloudinary...");
      const cldRes = await uploadFile(req.file.buffer, req.file.originalname);

      const audience = req.body.audience === "selected" ? "selected" : "all";
      const allowedUsers =
        audience === "selected" ? parseAllowedUsers(req.body.allowedUsers) : [];

      if (audience === "selected" && allowedUsers.length === 0) {
        log("Rejected: 'selected' audience with no users.");
        return res
          .status(400)
          .json({ message: "Please select at least one user for this file." });
      }

      log("Step 2: saving record to MongoDB...");
      const tDb = Date.now();
      const data = await Resource.create({
        title: req.body.title,
        fileUrl: cldRes.secure_url,
        fileName: req.file.originalname,
        fileType: (req.file.originalname.split(".").pop() || "").toLowerCase(),
        audience,
        allowedUsers,
        uploadedBy: req.user._id,
      });
      log("DB save OK in", Date.now() - tDb, "ms | id:", data._id);

      log("DONE total", Date.now() - t0, "ms");
      res.status(201).json(data);
    } catch (error) {
      log("UPLOAD ERROR after", Date.now() - t0, "ms:", {
        name: error.name,
        message: error.message,
        http_code: error.http_code,
      });
      // Respond directly so the request never hangs (the global error handler
      // only replies for "operational" errors, which would otherwise leave the
      // client waiting until it times out).
      return res.status(error.http_code || 500).json({
        message: error.message || "Upload failed. Please try again.",
      });
    }
  }
);

// Router-level error handler — catches multer errors (e.g. file too large)
// thrown by the upload middleware before the route body runs.
router.use((err, req, res, next) => {
  log("ROUTER ERROR:", err.code || err.name, "-", err.message);
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum allowed size is 50MB."
        : `Upload error: ${err.message}`;
    return res.status(400).json({ message });
  }
  return res.status(500).json({ message: err.message || "Something went wrong." });
});

// List every download with audience details (super admin manage view)
router.get("/", protect, restrictTo("superAdmin"), async (req, res, next) => {
  try {
    const data = await Resource.find()
      .populate({
        path: "allowedUsers",
        select: "username branch",
        populate: { path: "branch", select: "studyCentreName studyCentreCode" },
      })
      .populate("uploadedBy", "username")
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// List the downloads visible to the logged-in user
router.get("/my", protect, async (req, res, next) => {
  try {
    const filter =
      req.user.role === "superAdmin"
        ? {}
        : { $or: [{ audience: "all" }, { allowedUsers: req.user._id }] };

    const data = await Resource.find(filter)
      .select("title fileUrl fileName fileType createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

// Delete a download (super admin only)
router.delete("/:id", protect, restrictTo("superAdmin"), async (req, res, next) => {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "File not found." });
    }
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
