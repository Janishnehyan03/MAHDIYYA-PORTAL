const mongoose = require("mongoose");
const feeRateSchema = new mongoose.Schema({
  academicYear: { type: String, required: true },
  affiliationFee: { type: Number, required: true, min: 0 },
  perStudentFee: { type: Number, required: true, min: 0 },
  effectiveFrom: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Types.ObjectId, ref: "User" },
}, { timestamps: true });
feeRateSchema.index({ academicYear: 1, effectiveFrom: -1 });
module.exports = mongoose.model("FeeRate", feeRateSchema);
