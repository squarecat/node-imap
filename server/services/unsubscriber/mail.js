import logger from '../../utils/logger';
import { sendMail } from '../../utils/email';

const unsubMailOptions = {
  from: 'Leave Me Alone <unsubscribebot@leavemealone.app>',
  text: 'unsubscribe'
};

function sendUnsubscribeMail({ toAddress, subject = 'unsubscribe' }) {
  logger.info('email-utils: sending unsubscribe mail');
  return sendMail({
    ...unsubMailOptions,
    to: toAddress,
    subject
  });
}

export async function unsubscribeWithMailTo(unsubMailto) {
  try {
    // const address = unsubMailto.replace('mailto:', '');
    const [mailto, paramsString = ''] = unsubMailto.split('?');
    const toAddress = mailto.replace('mailto:', '');
    const params = paramsString.split('&').reduce((out, p) => {
      var d = p.split('=');
      return { ...out, [d[0]]: d[1] };
    }, {});

    const sent = await sendUnsubscribeMail({ toAddress, ...params });
    return { estimatedSuccess: !!sent };
  } catch (err) {
    return { estimatedSuccess: false };
  }
}
