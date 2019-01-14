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

const reminderMailOptions = {
  from: 'Leave Me Alone <reminders@leavemealone.app>'
};

export function sendUnsubscribeMail({ toAddress, subject = 'unsubscribe' }) {
  console.log('email-utils: sending unsubscribe mail');
  return sendMail({
    ...unsubMailOptions,
    to: toAddress,
    subject
  });
}

export function sendGiftCouponMultiMail({
  toAddress,
  scanPeriod,
  coupons,
  quantity = 1
}) {
  return sendMail({
    ...giftMailOptions,
    subject: 'Thank you for purchasing gift scans',
    to: toAddress,
    text: `Thank you for purchasing ${quantity} gift scans for ${scanPeriod}. Your coupon codes are:\n\n${coupons
      .map(c => c)
      .join('\n')}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

export function sendGiftCouponMail({ toAddress, scanPeriod, coupon }) {
  return sendMail({
    ...giftMailOptions,
    to: toAddress,
    text: `Thank you for purchasing a gift scan for ${scanPeriod}. Your coupon code is:\n\n${coupon}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

export function sendReminderMail({ toAddress, reminderPeriod, coupon }) {
  return sendMail({
    ...reminderMailOptions,
    subject: `Reminder 🕐 - it's been ${reminderPeriod} since your last scan`,
    to: toAddress,
    text: `You asked us to remind you to use Leave Me Alone again.\n\nIt's been ${reminderPeriod} since your last scan.\n\nKeep your inbox clean by scanning again now. Use the coupon ${coupon} for 10% off your next purchase.\n\nJames & Danielle\n\nLeave Me Alone`
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
