const mongoose = require('mongoose');
const admissionSchema = new mongoose.Schema({
    admissionName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
    },
    endDate: {
        type: Date,
    },
    status: {
        type: String, // active, inactive
    }
});

const Admission = mongoose.model('Admission', admissionSchema);
module.exports = Admission;