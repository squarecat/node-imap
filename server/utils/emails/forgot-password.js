import { SIGN_OFF, sendTransactionalMail } from './transactional';
import { mailgun, urls } from 'getconfig';

import logger from '../logger';

const options = {
  from: `Leave Me Alone <noreply@${mailgun.domains.transactional}>`,
  subject: 'Reset your password'
};

export function sendForgotPasswordMail({ toAddress, resetCode }) {
  logger.info('email-utils: sending forgot password mail');

  let text = `A password reset was requested for your account (${toAddress}) on Leave Me Alone (${
    urls.base
  }). If you did not authorize this, you may simply ignore this email.\n\nTo continue with your password reset, enter the following code on the password reset screen and you will be able to change your password.\n\nReset code: ${resetCode}\n\nThis code will expire in 2 hours.\n\n${SIGN_OFF}`;

  return sendTransactionalMail({
    ...options,
    to: toAddress,
    text
  });
}
