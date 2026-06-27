const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    // Cloudinary secure URL of the uploaded file
    fileUrl: {
      type: String,
      required: [true, "File is required"],
    },
    // Original file name (used for nicer downloads)
    fileName: {
      type: String,
    },
    // File extension (pdf, xlsx, docx ...)
    fileType: {
      type: String,
    },
    // Who is allowed to see/download this file.
    // "all"      -> every admin / user
    // "selected" -> only the users listed in allowedUsers
    audience: {
      type: String,
      enum: ["all", "selected"],
      default: "all",
    },
    allowedUsers: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Auth",
      },
    ],
    uploadedBy: {
      type: mongoose.Types.ObjectId,
      ref: "Auth",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resource", resourceSchema);
