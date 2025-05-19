const { google } = require('googleapis');
const credentials = require('./credentials.json');
const config = require('./config');

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

async function writeToSheet(nickname, lineId) {
    try {
        const client = await auth.getClient();
        const sheets = google.sheets({ version: 'v4', auth: client });

        const timestamp = new Date().toLocaleString('zh-TW', {
            timeZone: 'Asia/Taipei',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const values = [[timestamp, nickname, lineId]];
        console.log('➡️ 準備寫入資料：', values);
        console.log('➡️ 使用工作表 ID：', config.sheetId);

        await sheets.spreadsheets.values.append({
            spreadsheetId: config.sheetId,
            range: '工作表1!A:C',
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });

        console.log(`✅ 已寫入 Google Sheet：${nickname} (${lineId})`);
    } catch (error) {
        console.error('❌ 寫入 Google Sheet 錯誤：', error.response?.data || error.message || error);
        throw new Error('寫入表單失敗');
    }
}

module.exports = { writeToSheet };