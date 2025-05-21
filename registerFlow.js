const { writeToSheet } = require('./sheets');

const sessions = new Map();

async function handleMessage(event, client) {
    const userId = event.source.userId;
    const message = event.message;
    const session = sessions.get(userId) || { step: 0, data: {} };

    try {
        if (session.step === 0) {
            if (message.text === '我要提案') {
                session.step = 1;
                sessions.set(userId, session);
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '請提供商品名稱：'
                });
                return;
            }
        } else if (session.step === 1) {
            session.data.productName = message.text;
            session.step = 2;
            sessions.set(userId, session);
            await client.replyMessage(event.replyToken, {
                type: 'text',
                text: '請提供商品圖片：'
            });
            return;
        } else if (session.step === 2) {
            if (message.type === 'image') {
                const imageId = message.id;
                const productName = session.data.productName;

                // 寫入 Google Sheet
                await writeToSheet(productName, imageId);

                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '✅ 提案成功！我們會盡快審核，謝謝你的分享。'
                });
                sessions.delete(userId);
                return;
            } else {
                await client.replyMessage(event.replyToken, {
                    type: 'text',
                    text: '請上傳一張圖片喔（不是文字）'
                });
                return;
            }
        }

        // 預設處理非流程指令
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '請從主選單選擇功能進行操作。'
        });
    } catch (err) {
        console.error('❌ 提案流程錯誤:', err);
        await client.replyMessage(event.replyToken, {
            type: 'text',
            text: '發生錯誤，請稍後再試一次。'
        });
        sessions.delete(userId);
    }
}

module.exports = { handleMessage };