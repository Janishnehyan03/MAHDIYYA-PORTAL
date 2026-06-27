const router = require("express").Router();
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const Resource = require("../models/resourceModel");
const { protect, restrictTo } = require("../controllers/authController");

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

// Stream the raw file buffer straight to Cloudinary.
// This avoids base64-encoding the whole file (which inflates the payload by
// ~33% and buffers it in memory), so uploads are noticeably faster.
function streamUpload(buffer) {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now();
    const cfg = cloudinary.config();
    log("Cloudinary upload_stream: opening stream... config in use:", {
      cloud_name: cfg.cloud_name || "MISSING",
      api_key: cfg.api_key ? "set" : "MISSING",
      api_secret: cfg.api_secret ? "set" : "MISSING",
    });
    let stream;
    try {
      stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "resources" },
        (error, result) => {
          if (error) {
            log("Cloudinary upload FAILED after", Date.now() - startedAt, "ms:");
            console.error("[resources] RAW Cloudinary error >>>", error);
            return reject(error);
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
    } catch (syncErr) {
      // upload_stream throws synchronously when credentials are missing/invalid
      log("Cloudinary threw synchronously while opening the stream:");
      console.error("[resources] RAW sync error >>>", syncErr);
      return reject(
        new Error(
          typeof syncErr === "string"
            ? syncErr
            : syncErr?.message || "Cloudinary configuration error (check API key/secret/cloud name)."
        )
      );
    }
    stream.on("error", (err) => {
      log("Cloudinary stream error:");
      console.error("[resources] RAW stream error >>>", err);
      reject(err);
    });
    stream.end(buffer);
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
      const cldRes = await streamUpload(req.file.buffer);

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
