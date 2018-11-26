import nodemailer from 'nodemailer';

// create the transporter only once
// use the default sendmail binary
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: 'unix',
  path: '/usr/sbin/sendmail'
});

const mailOptions = {
  from: 'leavemealone@squarecat.io',
  text: 'unsubscribe'
};

export async function sendUnsubscribeMail({
  toAddress,
  subject = 'unsubscribe'
}) {
  console.log('email-utils: to address', toAddress);
  console.log('email-utils: subject', subject);
  try {
    const info = await transporter.sendMail({
      ...mailOptions,
      to: toAddress,
      subject
    });
    console.log('email-utils: info envelope', info.envelope);
    console.log('email-utils: info messageId', info.messageId);
    return true;
  } catch (err) {
    console.error(
      'unsubscribe-service: failed to send unsubscribe mail',
      toAddress
    );
    throw err;
  }
}
