import { domains, urls } from 'getconfig';

import logger from '../logger';
import { sendTransactionalMail } from './transactional';

const options = {
  from: `Leave Me Alone <noreply@${domains.transactional}>`,
  subject: 'Reset your password'
};

export function sendVerifyEmailMail({ toAddress, code }) {
  logger.info('email-utils: sending verify email mail');

  let text = `Use the following link to reset your password.

<a href="${urls.base}/auth/reset/${code}">Reset</a>

Thanks!
James & Danielle`;

  return sendTransactionalMail({
    ...options,
    to: toAddress,
    text
  });
}
