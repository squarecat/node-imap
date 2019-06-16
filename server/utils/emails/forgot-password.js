import { mailgun } from 'getconfig';

import logger from '../logger';
import { sendTransactionalMail } from './transactional';

const options = {
  from: `Leave Me Alone <noreply@${mailgun.domains.transactional}>`,
  subject: 'Reset your password'
};

export function sendForgotPasswordMail({ toAddress, resetCode }) {
  logger.info('email-utils: sending forgot password mail');

  let text = `Enter the following code on the password reset screen to change your password.\n\nReset code: ${resetCode}\n\nJames & Danielle\n\nLeave Me Alone`;

  return sendTransactionalMail({
    ...options,
    to: toAddress,
    text
  });
}
