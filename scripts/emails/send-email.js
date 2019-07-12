const newsletterEmails = require('../../server/utils/emails/newsletter');

const templates = require('./templates/release-v2');
const { html, text } = templates;

const options = {
  subject: 'Keeping a clean inbox with Leave Me Alone just got easier!',
  html,
  text
};

newsletterEmails.sendNewsletterMail(options);
