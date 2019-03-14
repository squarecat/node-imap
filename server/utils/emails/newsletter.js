import { PromiseProvider } from 'mongoose';
import config from 'getconfig';
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

export async function addSubscriber(email) {
  const member = {
    address: email,
    subscribed: true,
    upsert: 'yes'
  };
  return new Promise((resolve, reject) => {
    list.members().create(member, err => {
      if (err) {
        console.log('emails-newsletter: failed to add subscriber');
        console.log(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}

export async function updateSubscriber(email, { subscribed = true } = {}) {
  return new Promise((resolve, reject) => {
    list.members(email).update({ subscribed }, err => {
      if (err) {
        console.log('emails-newsletter: failed to update subscriber');
        console.log(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}

export async function removeSubscriber(email) {
  return new Promise((resolve, reject) => {
    list.members(email).delete(err => {
      if (err) {
        console.log('emails-newsletter: failed to remove subscriber');
        console.log(err);
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
  console.log('emails-newsletter: sending newsletter mail to', opts.to);
  console.log('emails-newsletter: sending newsletter mail from', opts.from);
  return new Promise((resolve, reject) => {
    newsletterTransport.messages().send(opts, err => {
      if (err) {
        console.log('failed to send mail');
        console.log(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}
