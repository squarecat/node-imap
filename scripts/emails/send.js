require('@babel/polyfill');
require('@babel/register');

const newsletterEmails = require('../../server/utils/emails/newsletter');

const templates = require('./templates/save-the-planet');
const { html, text } = templates;

const options = {
  to: 'newsletter@beta.mail.leavemealone.xyz', // this is the test list with just Danielle  & James on
  subject: 'Fix the climate one unsubscribe at a time! 🌳',
  html,
  text
};

newsletterEmails.sendNewsletterMail(options);
