const dotenv = require('dotenv');

dotenv.config();

module.exports = Object.freeze({
    // PORT: process.env.PORT,
    // Google sheet
    GOOGLE_SHEET_CLIENT_EMAIL: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
    GOOGLE_SHEET_PRIVATE_KEY: process.env.GOOGLE_SHEET_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID
});