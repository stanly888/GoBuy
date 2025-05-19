const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

const app = express();

// ❌ 不要加 express.json()，會破壞 LINE 的 raw body
// app.use(express.json()); ← 這行移除

const client = new line.Client(config.lineConfig);
const sessions = new Map();

// ✅ 正確的 webhook 設定
app.post('/webhook', line.middleware(config.lineConfig), async (req, res) => {
    const events = req.body.events;
    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            await registerFlow.handleMessage(event, client, sessions);
        }
    }
    res.sendStatus(200);
});

// ✅ 其他路由若需要 JSON，可另開
// app.use('/api', express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Gobuy Bot webhook is running on port ${port}`);
});
