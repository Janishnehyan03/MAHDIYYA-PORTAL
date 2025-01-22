const express = require('express');
const Admission = require('../models/admissionModel'); // Adjust the path as necessary
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

// Get all admissions
router.get('/', async (req, res) => {
    try {
        const admissions = await Admission.find();
        res.json(admissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one admission
router.get('/:id', getAdmission, (req, res) => {
    res.json(res.admission);
});

// Create an admission
router.post('/', protect, restrictTo('superAdmin'), async (req, res) => {
    const admission = new Admission({
        admissionName: req.body.admissionName,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        status: req.body.status
    });

    try {
        const newAdmission = await admission.save();
        res.status(201).json(newAdmission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update an admission
router.patch('/:id',protect, restrictTo('superAdmin'), getAdmission, async (req, res) => {
    if (req.body.admissionName != null) {
        res.admission.admissionName = req.body.admissionName;
    }
    if (req.body.startDate != null) {
        res.admission.startDate = req.body.startDate;
    }
    if (req.body.endDate != null) {
        res.admission.endDate = req.body.endDate;
    }
    if (req.body.status != null) {
        res.admission.status = req.body.status;
    }

    try {
        const updatedAdmission = await res.admission.save();
        res.json(updatedAdmission);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an admission
router.delete('/:id',protect, restrictTo('superAdmin'), getAdmission, async (req, res) => {
    try {
        await res.admission.remove();
        res.json({ message: 'Deleted Admission' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get admission by ID
async function getAdmission(req, res, next) {
    let admission;
    try {
        admission = await Admission.findById(req.params.id);
        if (admission == null) {
            return res.status(404).json({ message: 'Cannot find admission' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.admission = admission;
    next();
}

module.exports = router;