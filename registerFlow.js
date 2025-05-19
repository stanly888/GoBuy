const { writeToSheet } = require('./sheets');

async function handleMessage(event, client, sessions) {
    const userId = event.source.userId;
    const text = event.message.text.trim();
    
    // 初始化會話
    if (!sessions.has(userId)) {
        // 只有當使用者輸入註冊關鍵字才啟動流程
        if (text.toLowerCase() === '我要註冊') {
            sessions.set(userId, { step: 1, data: {} });
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: '請輸入您的暱稱：'
            });
        } else {
            // 非註冊指令時靜默不回或提示
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: '請輸入：「我要註冊」以開始 Gobuy 註冊流程'
            });
        }
        return;
    }

    // 使用者正在註冊中
    const session = sessions.get(userId);

    try {
        switch (session.step) {
            case 1:
                session.data.nickname = text;
                session.step = 2;
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '請輸入您的 LINE ID（此將作為推薦碼）：'
                });
                break;

            case 2:
                session.data.lineId = text;

                // 寫入 Google Sheet
                await writeToSheet(session.data.nickname, session.data.lineId);

                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: `✅ 註冊完成！\n你的推薦碼是：${session.data.lineId}\n快分享給朋友加入 Gobuy 吧！`
                });

                // 清除 session
                sessions.delete(userId);
                break;

            default:
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '流程錯誤，請重新輸入「我要註冊」'
                });
                sessions.delete(userId);
        }
    } catch (err) {
        console.error('❌ 註冊流程錯誤:', err);
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '系統錯誤，請稍後再試或輸入「我要註冊」重新開始。'
        });
        sessions.delete(userId);
    }
}

module.exports = { handleMessage };