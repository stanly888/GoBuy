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
        session.step = 0;
        sessions.delete(userId);

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '✅ 提案已送出，我們會盡快審核。'
        });
        return;
      } else {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: '請上傳圖片喔（不是文字）'
        });
        return;
      }
    }

    // 非流程指令 fallback
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '請從主選單點選「我要提案」開始操作。'
    });
  } catch (err) {
    console.error('❌ 對話錯誤:', err);
    sessions.delete(userId);
    await client.replyMessage(event.replyToken, {
      type: 'text',
      text: '系統發生錯誤，請稍後再試。'
    });
  }
}

module.exports = { handleMessage };