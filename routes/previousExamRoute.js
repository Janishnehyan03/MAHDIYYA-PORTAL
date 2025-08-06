const mongoose = require("mongoose");
const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
const {
  getSheetValues,
  getGoogleSheetClient,
} = require("../utils/googleSheets");
const { readGoogleSheet } = require("../utils/sheetCrud");
const router = express.Router();

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

// A more robust way to get the sheet ID from a URL
function getSheetIdFromUrl(url) {
  const match = url.match(/\/d\/(.*?)\//);
  return match ? match[1] : null;
}

router.get("/:id", async (req, res) => {
  try {
    // 1. Fetch data from your database
    const previousExam = await PreviousExam.findById(req.params.id).populate(
      "admission"
    );
    if (!previousExam) {
      return res.status(404).send({ error: "PreviousExam not found" });
    }

    // 2. Robustly extract the Google Sheet ID
    const googleSheetId = getSheetIdFromUrl(previousExam.fileUrl);
    if (!googleSheetId) {
      return res.status(400).send({ error: "Invalid Google Sheet URL format" });
    }

    // 3. Get the specific sheet name from the query parameter
    const { sheetName } = req.query;

    let googleSheetData = {};

    try {
      const googleSheetClient = await getGoogleSheetClient();

      // --- NEW LOGIC ---
      if (sheetName) {
        // --- FAST PATH: Fetch only the requested sheet ---
        console.log(`Fetching specific sheet: "${sheetName}"`);
        const values = await readGoogleSheet(
          googleSheetClient,
          googleSheetId,
          sheetName, // Use the sheet name from the query
          "A:Z" // or your desired range
        );
        googleSheetData[sheetName] = values;
      } else {
        // --- FALLBACK: Fetch all sheets (your original logic) ---
        console.log("No sheetName provided, fetching all sheets.");
        const metaRes = await googleSheetClient.spreadsheets.get({
          spreadsheetId: googleSheetId,
        });

        const sheetNames = metaRes.data.sheets.map((s) => s.properties.title);

        const sheetValuePromises = sheetNames.map((name) =>
          readGoogleSheet(googleSheetClient, googleSheetId, name, "A:Z")
            .then((values) => ({ name, values }))
            .catch((err) => ({
              name,
              values: { error: `Failed to fetch sheet: ${err.message}` },
            }))
        );

        const results = await Promise.all(sheetValuePromises);
        results.forEach((r) => {
          googleSheetData[r.name] = r.values;
        });
      }
    } catch (err) {
      // This catch block will handle errors from both paths (e.g., sheet not found, API auth failure)
      console.error("Error fetching Google Sheet data:", err);
      // Check for common Google API errors
      if (err.code === 404) {
        return res.status(404).send({
          error: "Google Sheet not found or you do not have permission.",
        });
      }
      if (err.message.includes("Unable to parse range")) {
        return res.status(400).send({
          error: `The sheet name "${sheetName}" was not found in the document.`,
        });
      }
      // Generic error for other issues
      return res.status(500).send({
        error: "A problem occurred while fetching data from Google Sheets.",
      });
    }

    // 4. Send the final response
    res.status(200).send({
      previousExam,
      googleSheetData,
    });
  } catch (error) {
    res.status(500).send({ error: error.message });
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
