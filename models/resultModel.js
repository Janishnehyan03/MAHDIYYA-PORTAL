// models/resultModel.js
const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    deleted: { type: Boolean, default: false },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    // marksObtained: numeric value or null if absent
    marksObtained: { type: Number, min: 0, default: null },
    // Marks "A" (absent) is represented as absent: true
    absent: { type: Boolean, default: false },
    yearAndMonth: { type: String },
  },
  { timestamps: true }
);

// Compound unique index to prevent duplicate active mark entries
// Partial index excludes deleted=true documents so soft-deleted records won't block inserts
resultSchema.index(
  { student: 1, exam: 1, subject: 1, class: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
);

// Always exclude soft-deleted by default for find queries
resultSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

const Result = mongoose.model("Result", resultSchema);
module.exports = Result;
