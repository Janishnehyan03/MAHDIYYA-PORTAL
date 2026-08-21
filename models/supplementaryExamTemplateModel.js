const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: [true, "Semester name is required"],
    trim: true,
  },
  subjects: [
    {
      type: String,
      trim: true,
    },
  ],
});

const supplementaryExamTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    semesters: [semesterSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

supplementaryExamTemplateSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model(
  "SupplementaryExamTemplate",
  supplementaryExamTemplateSchema
);
