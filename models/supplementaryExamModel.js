const mongoose = require("mongoose");

const supplementaryExamSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    registerNo: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    studentName: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    studyCentreName: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    studyCentreCode: {
      type: String,
      uppercase: true,
      trim: true,
      required: true,
    },
    semester: {
      type: String,
      trim: true,
      default: "",
    },
    subjectMarks: [
      {
        subjectName: {
          type: String,
          uppercase: true,
          trim: true,
          required: true,
        },
        mark: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],
    studyCentreSubmitted: {
      type: Boolean,
      default: false,
    },
    superAdminUploadedAt: Date,
    centreSubmittedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

supplementaryExamSchema.index(
  { class: 1, student: 1 },
  { unique: true, partialFilterExpression: { deleted: false } }
);

supplementaryExamSchema.pre(/^find/, function (next) {
  this.find({ deleted: { $ne: true } });
  next();
});

module.exports = mongoose.model("SupplementaryExam", supplementaryExamSchema);
