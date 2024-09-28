const mongoose = require("mongoose");

const examSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  academicYear: { type: String, required: true },
  maxCceMark: { type: Number, required: true },
  maxPaperMark: { type: Number, required: true },
  isActive: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

examSchema.pre(/^find/, function (next) {
  // Only include documents where the deleted field is not true
  this.find({ deleted: { $ne: true } });
  next();
});

const Exam = mongoose.model("Exam", examSchema);
module.exports = Exam;
