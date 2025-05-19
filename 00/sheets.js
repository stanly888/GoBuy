const { google } = require('googleapis');
const credentials = require('./credentials.json');
const config = require('./config');

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function writeToSheet(nickname, lineId) {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const values = [[new Date().toLocaleString(), nickname, lineId]];
    await sheets.spreadsheets.values.append({
        spreadsheetId: config.sheetId,
        range: '工作表1!A:C',
        valueInputOption: 'USER_ENTERED',
        resource: { values }
    });
}

module.exports = { writeToSheet };
