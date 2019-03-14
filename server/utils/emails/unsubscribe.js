import config from 'getconfig';
import mailgun from 'mailgun-js';
import { sendMail } from './index';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;

const unsubscribeTransport = mailgun({
  apiKey,
  domain: domains.unsubscribe
});

const address = `unsubscribebot@${config.mailgun.domains.newsletter}`;
export const unsubOptions = {
  from: `Leave Me Alone <${address}>`,
  text: 'unsubscribe'
};

export function sendUnsubscribeMail(options) {
  return sendMail({ ...unsubOptions, ...options }, unsubscribeTransport);
}
