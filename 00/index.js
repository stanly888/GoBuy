const express = require('express');
const line = require('@line/bot-sdk');
const registerFlow = require('./registerFlow');
const config = require('./config');

const app = express();
app.use(express.json());

const client = new line.Client(config.lineConfig);
const sessions = new Map();

app.post('/webhook', line.middleware(config.lineConfig), async (req, res) => {
    const events = req.body.events;
    for (const event of events) {
        if (event.type === 'message' && event.message.type === 'text') {
            await registerFlow.handleMessage(event, client, sessions);
        }
    }
    res.sendStatus(200);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Gobuy Bot webhook is running on port ${port}`);
});
