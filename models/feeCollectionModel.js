const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0.01 },
  paidOn: { type: Date, default: Date.now },
  method: { type: String, enum: ["cash", "bank", "upi", "cheque", "other"], default: "bank" },
  reference: String,
  notes: String,
}, { _id: true });

const feeCollectionSchema = new mongoose.Schema({
  studyCentre: { type: mongoose.Types.ObjectId, ref: "Branch", required: true },
  academicYear: { type: String, required: true },
  affiliationFee: { type: Number, required: true, min: 0 },
  perStudentFee: { type: Number, required: true, min: 0 },
  studentCount: { type: Number, required: true, min: 0 },
  totalDue: { type: Number, required: true, min: 0 },
  payments: [paymentSchema],
  status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
  calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

feeCollectionSchema.index({ studyCentre: 1, academicYear: 1 }, { unique: true });
module.exports = mongoose.model("FeeCollection", feeCollectionSchema);
