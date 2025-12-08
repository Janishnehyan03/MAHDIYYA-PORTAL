// models/cceModel.js
const mongoose = require("mongoose");

const cceSchema = new mongoose.Schema(
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
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    // ✅ Numeric mark (or null) + absent flag
    cceMark: { type: Number, min: 0, default: null },
    absent: { type: Boolean, default: false },
    yearAndMonth: { type: String },
  },
  { timestamps: true }
);

// ✅ Soft-delete filter for all find queries
cceSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

// ✅ DB-level uniqueness: no duplicate (student, exam, subject, class) when not deleted
cceSchema.index(
  { student: 1, exam: 1, subject: 1, class: 1 },
  {
    unique: true,
    partialFilterExpression: { deleted: false },
  }
);

// ❌ REMOVE this (causes async validation issues & races):
// cceSchema.path("student").validate(...)

const CceMark = mongoose.model("CceMark", cceSchema);
module.exports = CceMark;
