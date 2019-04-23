import config from 'getconfig';
import logger from '../logger';
import mailgun from 'mailgun-js';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;

const listDomain = config.mailgun.domains.newsletter;
export const address = `newsletter@${listDomain}`;
const newsletterOptions = {
  from: `Leave Me Alone <newsletter@${listDomain}>`,
  to: address
};

const newsletterTransport = mailgun({
  apiKey,
  domain: domains.newsletter
});

const list = newsletterTransport.lists(address);

export async function addUpdateSubscriber(email, { subscribed = true } = {}) {
  if (process.env.NODE_ENV === 'development') return true;

  const member = {
    address: email,
    subscribed,
    upsert: 'yes'
  };
  return new Promise((resolve, reject) => {
    list.members().create(member, err => {
      if (err) {
        logger.error('emails-newsletter: failed to add subscriber');
        logger.error(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}

export async function removeSubscriber(email) {
  if (process.env.NODE_ENV === 'development') return true;

  return new Promise((resolve, reject) => {
    list.members(email).delete(err => {
      if (err) {
        logger.error('emails-newsletter: failed to remove subscriber');
        logger.error(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}

export async function sendNewsletterMail(options) {
  const opts = {
    ...newsletterOptions,
    ...options
  };
  logger.debug('emails-newsletter: sending newsletter mail');
  return new Promise((resolve, reject) => {
    newsletterTransport.messages().send(opts, err => {
      if (err) {
        logger.error('failed to send mail');
        logger.error(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}
