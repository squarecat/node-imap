import mailgun from 'mailgun-js';
import config from 'getconfig';

const apiKey = config.mailgun.apiKey;
const domain = config.mailgun.domain;

const transport = mailgun({ apiKey, domain });

const unsubMailOptions = {
  from: 'Leave Me Alone <unsubscribebot@leavemealone.app>',
  text: 'unsubscribe'
};

const giftMailOptions = {
  from: 'Leave Me Alone <purchases@leavemealone.app>',
  subject: 'Thank you for purchasing a gift scan'
};

export function sendUnsubscribeMail({ toAddress, subject = 'unsubscribe' }) {
  console.log('email-utils: sending unsubscribe mail');
  return sendMail({
    ...unsubMailOptions,
    to: toAddress,
    subject
  });
}

export function sendGiftCouponMail({ toAddress, scanPeriod, coupon }) {
  return sendMail({
    ...giftMailOptions,
    to: toAddress,
    text: `Thank you for purchasing a gift scan for ${scanPeriod}. Your coupon code is:\n\n${coupon}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

function sendMail(options) {
  return new Promise((resolve, reject) => {
    transport.messages().send(options, err => {
      if (err) {
        console.error('email-utils: failed to send mail');
        console.error(err);
        return reject(err);
      }
      console.log('email-utils: mail successfully sent');
      return resolve(true);
    });
  });
}

// import nodemailer from 'nodemailer';

// // create the transporter only once
// // use the default sendmail binary
// const transporter = nodemailer.createTransport({
//   sendmail: true,
//   newline: 'unix',
//   path: '/usr/sbin/sendmail'
// });

// const mailOptions = {
//   from: 'leavemealone@squarecat.io',
//   text: 'unsubscribe'
// };

// export async function sendUnsubscribeMail({
//   toAddress,
//   subject = 'unsubscribe'
// }) {
//   console.log('email-utils: sending unsubscribe mail');
//   try {
//     await transporter.sendMail({
//       ...mailOptions,
//       to: toAddress,
//       subject
//     });
//     return true;
//   } catch (err) {
//     console.error('email-utils: failed to send unsubscribe mail');
//     console.error(err);
//     throw err;
//   }
// }
