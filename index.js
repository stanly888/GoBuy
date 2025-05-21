const fs = require('fs');
const path = require('path');
const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

// ✅ 自動還原 credentials.json（從 base64 環境變數解碼）
const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const credPath = path.join(__dirname, 'credentials.json');

if (base64 && !fs.existsSync(credPath)) {
  console.log('🛠️ 正在解碼 Google credentials...');
  const json = Buffer.from(base64, 'base64').toString('utf8');
  fs.writeFileSync(credPath, json);
  console.log('✅ credentials.json 已產生');
}

const app = express();

// ⚠️ LINE SDK 要求保留原始 body，不可提前 json parse！
const client = new line.Client(config.lineConfig);
const sessions = new Map();

// ✅ 正確處理 LINE webhook 請求（不可加 express.json）
app.post('/webhook', line.middleware(config.lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await registerFlow.handleMessage(event, client, sessions);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Webhook Crash:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ 如果你有其他 API，再額外用 express.json
app.use('/api', express.json()); // 目前沒用可以省略

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gobuy Bot webhook is running on port ${port}`);
});