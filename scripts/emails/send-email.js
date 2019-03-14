const newsletterEmails = require('../../server/utils/emails/newsletter');

const templates = require('./templates/release-outlook');
const { html, text } = templates;

const options = {
  subject: 'Leave Me Alone now supports Outlook!',
  // pretext: 'Clean your Outlook inbox of spam subscriptions',
  html,
  text
};

newsletterEmails.sendNewsletterMail(options);
