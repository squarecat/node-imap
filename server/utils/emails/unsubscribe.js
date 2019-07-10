import config from 'getconfig';
import mailgun from 'mailgun-js';
import { sendMail } from './index';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;

const unsubscribeTransport = mailgun({
  apiKey,
  domain: domains.unsubscribe
});

export function sendUnsubscribeMail(options) {
  const { userId, mailId, unsubscribeId } = options;
  const address = `${unsubscribeId}-bot@${domains.unsubscribe}`;
  const unsubOptions = {
    from: `Leave Me Alone <${address}>`,
    text: 'UNSUBSCRIBE',
    'v:user-id': userId,
    'v:email-id': mailId
  };
  return sendMail({ ...options, ...unsubOptions }, unsubscribeTransport);
}
