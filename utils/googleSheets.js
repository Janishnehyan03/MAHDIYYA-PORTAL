const { google } = require("googleapis");
const appConfig = require("../config/appConfig.js");

const { GOOGLE_SHEET_CLIENT_EMAIL, GOOGLE_SHEET_PRIVATE_KEY } = appConfig;

const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

const sheetClient = new google.auth.JWT(GOOGLE_SHEET_CLIENT_EMAIL, null, GOOGLE_SHEET_PRIVATE_KEY, scopes);

const sheets = google.sheets({
    version: 'v4',
    auth: sheetClient
});

module.exports = { sheets };