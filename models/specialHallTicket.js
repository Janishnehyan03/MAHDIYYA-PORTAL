const mongoose = require("mongoose");

const specialHallTicketSchame = new mongoose.Schema({
  method: String,
  institution: String,
  name: String,
  registerNo: String,
  semester: String,
  secondSem: String,
  forthSem: String,
  MAHDIYYAHSecondSem: String,
  MAHDIYYAHForthSem: String,
  MAHDIYYAHSixthSem: String,
  examCentre: String,
});

const SpecialHallTicket = mongoose.model(
  "SpecialHallTicket",
  specialHallTicketSchame
);

module.exports = SpecialHallTicket;
