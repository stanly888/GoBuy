const fs = require('fs');
const path = require('path');
const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

// ✅ 解碼並寫入 credentials.json（從 Render 環境變數）
const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;
const credPath = path.join(__dirname, 'credentials.json');

if (base64 && !fs.existsSync(credPath)) {
  console.log('🛠️ 正在解碼 Google credentials...');
  const json = Buffer.from(base64, 'base64').toString('utf8');
  fs.writeFileSync(credPath, json);
  console.log('✅ credentials.json 已產生');
}

const app = express();
const client = new line.Client(config.lineConfig);
const sessions = new Map();

// ✅ 正確處理 LINE webhook（不可用 express.json）
app.post('/webhook', line.middleware(config.lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === 'message') {
        await registerFlow.handleMessage(event, client, sessions);
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Webhook Crash:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ✅ 預留 API 區段（沒用可省略）
app.use('/api', express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gobuy Bot webhook is running on port ${port}`);
});