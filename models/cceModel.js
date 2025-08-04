const mongoose = require("mongoose");

const cceSchema = new mongoose.Schema({
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
  cceMark: { type: String, required: true },
  yearAndMonth: { type: String },
});

cceSchema.pre(/^find/, function (next) {
  // Only include documents where the deleted field is not true
  this.find({ deleted: { $ne: true } });
  next();
});

cceSchema.path("student").validate(async function (value) {
  const count = await this.constructor.countDocuments({
    student: value,
    exam: this.exam,
    subject: this.subject,
  });
  return !count;
}, "Duplicate mark entry for the subject.");

const CceMark = mongoose.model("CceMark", cceSchema);

module.exports = CceMark;
