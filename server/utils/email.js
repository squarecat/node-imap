import mailgun from 'mailgun-js';
import config from 'getconfig';

const apiKey = config.mailgun.apiKey;
const domain = config.mailgun.domain;

const transport = mailgun({ apiKey, domain });

const mailOptions = {
  from: 'Leave Me Alone <leavemealone@squarecat.io>',
  text: 'unsubscribe'
};

export function sendUnsubscribeMail({ toAddress, subject = 'unsubscribe' }) {
  console.log('email-utils: sending unsubscribe mail');
  return new Promise((resolve, reject) => {
    transport.messages().send(
      {
        ...mailOptions,
        to: toAddress,
        subject
      },
      err => {
        if (err) {
          console.error('email-utils: failed to send unsubscribe mail');
          console.error(err);
          return reject(err);
        }
        console.log('email-utils: successfully unsubscribed');
        return resolve(true);
      }
    );
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
