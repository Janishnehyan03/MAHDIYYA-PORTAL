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
  affiliationType: { type: String, enum: ["M1_M2", "DEGREE"], default: "M1_M2" },

  // Student counts
  m1m2StudentCount: { type: Number, default: 0, min: 0 },
  m3m5StudentCount: { type: Number, default: 0, min: 0 },
  studentCount: { type: Number, required: true, min: 0 },

  // Course Fee
  courseFeeM1M2: { type: Number, default: 600, min: 0 },
  courseFeeM3M5: { type: Number, default: 700, min: 0 },
  courseFeeTotal: { type: Number, default: 0, min: 0 },

  // Exam Fee
  examFeeM1M2: { type: Number, default: 150, min: 0 },
  examFeeM3M5: { type: Number, default: 200, min: 0 },
  examFeeTotal: { type: Number, default: 0, min: 0 },

  perStudentFee: { type: Number, default: 0, min: 0 },
  totalDue: { type: Number, required: true, min: 0 },
  payments: [paymentSchema],
  status: { type: String, enum: ["pending", "partial", "paid"], default: "pending" },
  calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

feeCollectionSchema.index({ studyCentre: 1, academicYear: 1 }, { unique: true });
module.exports = mongoose.model("FeeCollection", feeCollectionSchema);
