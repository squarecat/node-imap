import { mailgun, urls } from 'getconfig';

import logger from '../logger';
import { sendTransactionalMail, SIGN_OFF } from './transactional';

const options = {
  from: `Leave Me Alone <noreply@${mailgun.domains.transactional}>`,
  subject: 'Verify your email address'
};

export function sendVerifyEmailMail({ toAddress, code }) {
  logger.info('email-utils: sending verify email mail');

  const text = `Welcome to Leave Me Alone!\n\nThank you for signing up. Please verify your email address to begin using your account by clicking the following link:\n\n${
    urls.base
  }/verify/${code}.\n\n${SIGN_OFF}`;

  return sendTransactionalMail({
    ...options,
    to: toAddress,
    text
  });
}
