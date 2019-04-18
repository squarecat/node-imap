import { domains, urls } from 'getconfig';

import logger from '../logger';
import { sendTransactionalMail } from './transactional';

const options = {
  from: `Leave Me Alone <noreply@${domains.transactional}>`,
  subject: 'Verify your email address'
};

export function sendVerifyEmailMail({ toAddress, code }) {
  logger.info('email-utils: sending verify email mail');

  let text = `Welcome to Leave Me Alone!

Before you can start using your account fully, we just need you to verify your email address. Click the link below to verify.

<a href="${urls.base}/auth/verify/${code}">Verify email</a>

Thanks!
James & Danielle`;

  return sendTransactionalMail({
    ...options,
    to: toAddress,
    text
  });
}
