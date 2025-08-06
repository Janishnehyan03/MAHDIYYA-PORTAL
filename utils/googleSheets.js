const { google } = require("googleapis");

async function getGoogleSheetClient() {
  const clientEmail = process.env.GOOGLE_SHEET_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEET_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_SHEET_CLIENT_EMAIL or GOOGLE_SHEET_PRIVATE_KEY environment variables.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

module.exports = { getGoogleSheetClient };