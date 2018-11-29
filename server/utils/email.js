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
  console.log('email-utils: sending unsubscribe mail');
  try {
    await transporter.sendMail({
      ...mailOptions,
      to: toAddress,
      subject
    });
    return true;
  } catch (err) {
    console.error('email-utils: failed to send unsubscribe mail');
    console.error(err);
    throw err;
  }
}
