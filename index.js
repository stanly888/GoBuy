const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

const app = express();

// ❗不要 app.use(express.json()) ← 千萬不要加！會破壞 LINE 的 raw body！

const client = new line.Client(config.lineConfig);
const sessions = new Map();

// ✅ 正確處理 LINE Webhook（原始 body 供驗簽）
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

// ✅ 其他非 webhook 的 API 如果需要 json 可以另開：
app.use('/api', express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Gobuy Bot webhook is running on port ${port}`);
});
