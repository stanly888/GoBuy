const { writeToSheet } = require('./sheets');

async function handleMessage(event, client, sessions) {
    const userId = event.source.userId;
    const text = event.message.text.trim();

    if (!sessions.has(userId)) sessions.set(userId, { step: 0, data: {} });
    const session = sessions.get(userId);

    switch (session.step) {
        case 0:
            if (text.toLowerCase() === '我要註冊') {
                session.step = 1;
                await client.replyMessage(event.replyToken, { type: 'text', text: '請輸入您的暱稱：' });
            }
            break;
        case 1:
            session.data.nickname = text;
            session.step = 2;
            await client.replyMessage(event.replyToken, { type: 'text', text: '請輸入您的 LINE ID（此將作為推薦碼）：' });
            break;
        case 2:
            session.data.lineId = text;
            session.step = 3;
            await writeToSheet(session.data.nickname, session.data.lineId);
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: `✅ 註冊完成！\n你的推薦碼是：${session.data.lineId}\n快分享給朋友來加入 Gobuy 吧！`
            });
            sessions.delete(userId);
            break;
        default:
            await client.replyMessage(event.replyToken, { type: 'text', text: '請輸入：我要註冊，開始註冊流程。' });
    }
}

module.exports = { handleMessage };
