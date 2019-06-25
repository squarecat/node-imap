const request = require('request');

const token = process.env.TELEGRAM_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

export function sendMessage(text, parseMode = null) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  return new Promise((resolve, reject) => {
    request
      .post(url, function(err, resp, body) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        resolve(body);
      })
      .form({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode
      });
  });
}
