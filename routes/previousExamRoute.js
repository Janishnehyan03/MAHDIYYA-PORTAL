const mongoose = require("mongoose");
const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const router = express.Router();
const { sheets } = require("../utils/googleSheets");

// Define the PreviousExam schema
const previousExamSchema = new mongoose.Schema({
  admission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admission",
    required: true,
  },
  className: { type: String, required: true },
  fileUrl: { type: String, required: true },
});

previousExamSchema.index({ admission: 1, className: 1 }, { unique: true });

// Create the PreviousExam model
const PreviousExam = mongoose.model("PreviousExam", previousExamSchema);

// Create a new PreviousExam
router.post("/", protect, restrictTo("superAdmin"), async (req, res) => {
  try {
    const previousExam = new PreviousExam(req.body);
    await previousExam.save();
    res.status(201).send(previousExam);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Read all PreviousExams
router.get("/", async (req, res) => {
  try {
    const previousExams = await PreviousExam.find().populate("admission");
    res.status(200).send(previousExams);
  } catch (error) {
    res.status(500).send(error);
  }
});

/**
 * Read a single PreviousExam by ID
 * Additionally, fetch and return Google Sheets data in the response
 */
router.get("/:id", async (req, res) => {
  try {
    const previousExam = await PreviousExam.findById(req.params.id).populate("admission");
    if (!previousExam) {
      return res.status(404).send({ error: "PreviousExam not found" });
    }

    // Google Sheets integration
    const spreadsheetId = "1SLjUSlV6hTxYpwJXWyj51CAUsS1jFHai";
    // Change to your actual sheet/tab name or use the default "Sheet1"
    const range = "Sheet1"; // Replace with the correct sheet name if different

    let sheetData = [];
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range,
      });
      sheetData = response.data.values || [];
      
    } catch (sheetsErr) {
      // If the sheet fetch fails, don't crash the endpoint, just include an error
      sheetData = { error: "Failed to fetch Google Sheets data", details: sheetsErr.message };
    }
console.log("Google Sheets Data:", sheetData);
    res.status(200).send({
      previousExam,
      googleSheetData: sheetData,
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a PreviousExam by ID
router.patch("/:id", protect, restrictTo("superAdmin"), async (req, res) => {
  try {
    const previousExam = await PreviousExam.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!previousExam) {
      return res.status(404).send({ error: "PreviousExam not found" });
    }
    res.status(200).send(previousExam);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a PreviousExam by ID
router.delete("/:id", protect, restrictTo("superAdmin"), async (req, res) => {
  try {
    const previousExam = await PreviousExam.findByIdAndDelete(req.params.id);
    if (!previousExam) {
      return res.status(404).send({ error: "PreviousExam not found" });
    }
    res.status(200).send(previousExam);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;