require('@babel/polyfill');
require('@babel/register');

const newsletterEmails = require('../../server/utils/emails/newsletter');

const templates = require('./templates/launch-v2');
const { html, text } = templates;

const options = {
  // to: 'newsletter@beta.mail.leavemealone.xyz', // this is the test list with just Danielle  & James on
  subject: 'Announcing Our Official v2.0 Launch',
  html,
  text
};

newsletterEmails.sendNewsletterMail(options);
