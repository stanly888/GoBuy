const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

const app = express();

// ⚠️ 不要加入任何會解析 JSON 的 middleware！
// 特別是：app.use(express.json()) 絕對不能加在全域！

const client = new line.Client(config.lineConfig);
const sessions = new Map();

// ✅ 正確處理 LINE webhook 請求（保留原始 request body）
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

// ✅ 如果你有其他 API，再另外開這裡才用 express.json()
app.use('/api', express.json()); // 可選：你沒用就先不寫

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gobuy Bot webhook is running on port ${port}`);
});
