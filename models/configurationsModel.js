const mongoose = require("mongoose");
const configurationSchema = new mongoose.Schema(
  {
    academicYear: {
      type: mongoose.Types.ObjectId,
      ref: "AcademicYear",
    },
    faSubmission: {
      type: Boolean,
      default: false,
    },
    hallTicketDownload: {
      type: Boolean,
      default: false,
    },
    newAdmission: {
      type: Boolean,
      default: false,
    },
    saSubmission: {
      type: Boolean,
      default: false,
    },
    lastRegisterNo: {
      type: String,
    },
    studentDataUpload: {
      type: Boolean,
      default: false,
    },
    supplementaryExam: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Configuration = mongoose.model("Configuration", configurationSchema);
module.exports = Configuration;
