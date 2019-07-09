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

export async function unsubscribeWithMailTo({ userId, mailId, unsubMailto }) {
  try {
    const [mailto, paramsString = ''] = unsubMailto.split('?');
    const toAddress = mailto.replace('mailto:', '');
    const params = paramsString.split('&').reduce((out, p) => {
      var d = p.split(/=(.+)/);
      const [k, v] = d;
      return { ...out, [k]: v };
    }, {});
    const sent = await sendUnsubscribeMail({
      toAddress,
      userId,
      mailId,
      ...params
    });
    return { estimatedSuccess: !!sent };
  } catch (err) {
    logger.error('mail-service: failed to unsubscribe');
    logger.error(err);
    return { estimatedSuccess: false };
  }
}
