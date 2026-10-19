const mongoose = require("mongoose");
const feeRateSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  affiliationFeeM1M2: { type: Number, required: true, default: 1000, min: 0 },
  affiliationFeeDegree: { type: Number, required: true, default: 1500, min: 0 },
  affiliationFee: { type: Number, min: 0 },

  // Course Fee
  // M1 & M2 = 600, M3 to M5 = 700
  courseFeeM1M2: { type: Number, required: true, default: 600, min: 0 },
  courseFeeM3M5: { type: Number, required: true, default: 700, min: 0 },

  // Exam Fee
  // M1 & M2 = 150, M3 to M5 = 200
  examFeeM1M2: { type: Number, required: true, default: 150, min: 0 },
  examFeeM3M5: { type: Number, required: true, default: 200, min: 0 },

  perStudentFee: { type: Number, default: 0, min: 0 },
  effectiveFrom: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
}, { timestamps: true });

feeRateSchema.index({ academicYear: 1, effectiveFrom: -1 });
module.exports = mongoose.model("FeeRate", feeRateSchema);
