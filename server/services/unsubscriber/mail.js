import logger from '../../utils/logger';
import { sendUnsubscribeMail as sendMail } from '../../utils/emails/unsubscribe';

function sendUnsubscribeMail({
  toAddress,
  subject = 'unsubscribe',
  ...variables
}) {
  logger.info('unsubscriber-mail: sending unsubscribe mail');
  return sendMail({
    to: toAddress,
    subject,
    ...variables
  });
}

export async function unsubscribeWithMailTo({ userId, emailId, unsubMailto }) {
  try {
    // const address = unsubMailto.replace('mailto:', '');
    const [mailto, paramsString = ''] = unsubMailto.split('?');
    const toAddress = mailto.replace('mailto:', '');
    const params = paramsString.split('&').reduce((out, p) => {
      var d = p.split('=');
      return { ...out, [d[0]]: d[1] };
    }, {});
    const sent = await sendUnsubscribeMail({
      toAddress,
      'v:user-id': userId,
      'v:email-id': emailId,
      ...params
    });
    return { estimatedSuccess: !!sent };
  } catch (err) {
    return { estimatedSuccess: false };
  }
}
