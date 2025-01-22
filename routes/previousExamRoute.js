const mongoose = require('mongoose');
const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const router = express.Router();
const { sheets } = require('../utils/googleSheets');

// Define the PreviousExam schema
const previousExamSchema = new mongoose.Schema({
    admission: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', required: true },
    className: { type: String, required: true },
    fileUrl: { type: String, required: true }
});

previousExamSchema.index({ admission: 1, className: 1 }, { unique: true });

// Create the PreviousExam model
const PreviousExam = mongoose.model('PreviousExam', previousExamSchema);

// Create a new PreviousExam
router.post('/', protect, restrictTo('superAdmin'), async (req, res) => {
    try {
        const previousExam = new PreviousExam(req.body);
        await previousExam.save();
        res.status(201).send(previousExam);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Read all PreviousExams
router.get('/', async (req, res) => {
    try {
        const previousExams = await PreviousExam.find().populate('admission')
        res.status(200).send(previousExams);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read a single PreviousExam by ID
router.get('/:id', async (req, res) => {
    try {
        const previousExam = await PreviousExam.findById(req.params.id);
        if (!previousExam) {
            return res.status(404).send();
        }

        const sheetId = previousExam.fileUrl.match(/\/d\/(.*?)\//)[1];

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Sheet1!A:BZ', // Ensure this matches the actual sheet and range
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No data found',
                data: [],
            });
        }

        res.status(200).json({
            success: true,
            message: 'Data retrieved successfully',
            data: rows, // Array of rows from the sheet
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch data',
        });
    }
});

// Update a PreviousExam by ID
router.patch('/:id', protect, restrictTo('superAdmin'), async (req, res) => {
    try {
        const previousExam = await PreviousExam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!previousExam) {
            return res.status(404).send();
        }
        res.status(200).send(previousExam);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a PreviousExam by ID
router.delete('/:id', protect, restrictTo('superAdmin'), async (req, res) => {
    try {
        const previousExam = await PreviousExam.findByIdAndDelete(req.params.id);
        if (!previousExam) {
            return res.status(404).send();
        }
        res.status(200).send(previousExam);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;