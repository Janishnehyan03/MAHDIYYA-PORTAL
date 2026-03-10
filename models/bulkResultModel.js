const mongoose = require("mongoose");

const bulkResultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true,
        },
        exam: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Exam",
            required: true,
        },
        marks: [
            {
                subject: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Subject",
                },
                fa: { type: String, default: "" },
                sa: { type: String, default: "" },
                tenPercent: { type: String, default: "" },
                tl: { type: String, default: "" },
                status: { type: String, default: "" },
            },
        ],
        noOfFailed: { type: String, default: "" },
        semStatus: { type: String, default: "" },
        gTotal: { type: String, default: "" },
        percentage: { type: String, default: "" },
        className: { type: String, default: "" },
        deleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

bulkResultSchema.pre(/^find/, function (next) {
    this.find({ deleted: { $ne: true } });
    next();
});

// Unique index to prevent duplicates for same student, exam, class
bulkResultSchema.index(
    { student: 1, exam: 1, class: 1 },
    { unique: true, partialFilterExpression: { deleted: false } }
);

const BulkResult = mongoose.model("BulkResult", bulkResultSchema);
module.exports = BulkResult;
