const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  className: {
    type: String,
    required: [true, "Class Name is required field"],
    uppercase: true,
  },
  classOrder: {
    type: Number,
    required: [true, "Class Order is required field"],
    unique: true,
  },
  courseLevel: {
    type: String,
    enum: ["M1_M2", "DEGREE"],
    default: "M1_M2",
  },
  deleted: { type: Boolean, default: false },
});

classSchema.pre(/^find/, function (next) {
  // Only include documents where the deleted field is not true
  this.find({ deleted: { $ne: true } });
  next();
});

const Class = mongoose.model("Class", classSchema);
module.exports = Class;
