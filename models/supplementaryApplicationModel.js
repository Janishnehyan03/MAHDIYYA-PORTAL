const mongoose = require("mongoose");

const supplementaryApplicationSchema = new mongoose.Schema(
  {
    examTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplementaryExamTemplate",
      required: [true, "Exam template is required"],
    },
    registerNo: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, "Register Number is required"],
    },
    studentName: {
      type: String,
      uppercase: true,
      trim: true,
      required: [true, "Student Name is required"],
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
    },
    studyCentreName: {
      type: String,
      uppercase: true,
      trim: true,
      default: "",
    },
    studyCentreCode: {
      type: String,
      uppercase: true,
      trim: true,
      default: "",
    },
    semester: {
      type: String,
      trim: true,
      required: [true, "Semester is required"],
    },
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    subjectMarks: [
      {
        subjectName: String,
        mark: String,
      }
    ],
    isManualStudent: {
      type: Boolean,
      default: false,
    },
    submittedBy: {
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

supplementaryApplicationSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model(
  "SupplementaryApplication",
  supplementaryApplicationSchema
);
