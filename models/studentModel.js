const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      uppercase: true,
      required: [true, "student name is required"],
      maxLength: [100, "100 characters are allowed"],
    },
    houseName: {
      type: String,
      uppercase: true,
      maxLength: [100, "100 characters are allowed"],
    },
    fatherName: {
      type: String,
      uppercase: true,
      maxLength: [100, "100 characters are allowed"],
    },
    place: {
      type: String,
      uppercase: true,
      maxLength: [100, "100 characters are allowed"],
    },
    district: {
      type: String,
      uppercase: true,
      maxLength: [30, "30 characters are allowed"],
    },
    postOffice: {
      type: String,
      uppercase: true,
      maxLength: [100, "100 characters are allowed"],
    },
    pinCode: {
      type: String,
      maxLength: [10, "10 characters are allowed"],
    },
    state: {
      type: String,
      uppercase: true,
      // required: [true, "state is required"],
      maxLength: [30, "30 characters are allowed"],
    },
    registerNo: {
      type: String,
      uppercase: true,
      maxLength: [50, "50 characters are allowed"],
      required: false,
    },

    dateOfBirth: {
      type: String,
      maxLength: [45, "15 characters are allowed"],
    },
    phone: {
      type: String,
      maxLength: [15, "15 characters are allowed"],
    },
    academicYear: {
      type: mongoose.Types.ObjectId,
      ref: "AcademicYear",
    },
    branch: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please select study centre"],
      maxLength: [100, "100 characters are allowed"],
      ref: "Branch",
    },
    transferredFrom: {
      type: mongoose.Types.ObjectId,
      // required: [true, "Please select study centre"],
      maxLength: [100, "100 characters are allowed"],
      ref: "Branch",
    },
    transferReason: String,
    verified: {
      type: Boolean,
      default: false,
    },
    class: {
      type: mongoose.Types.ObjectId,
      required: [true, "Please select a class"],
      ref: "Class",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    droppedOut: {
      type: Boolean,
      default: false,
    },
    imageUrl: String,
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);
studentSchema.pre(/^find/, function (next) {
  // Only include documents where the deleted field is not true
  this.find({ deleted: { $ne: true } });
  next();
});
const Student = mongoose.model("Student", studentSchema);
module.exports = Student;
