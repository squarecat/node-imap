import config from 'getconfig';
import logger from '../logger';
import mailgun from 'mailgun-js';
import { sendMail } from './index';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;
const baseUrl = config.urls.base;

export const SIGN_OFF = `Thanks!\nJames & Danielle\nFounders of Leave Me Alone`;

const transactionalTransport = mailgun({
  apiKey,
  domain: domains.transactional
});

export function sendOrganisationInviteMail({
  toAddress,
  organisationName,
  inviteCode
}) {
  logger.info('email-utils: sending invite mail');
  return sendTransactionalMail({
    from: `Leave Me Alone <noreply@${domains.transactional}>`,
    subject: `${organisationName} has invited you to use Leave Me Alone`,
    to: toAddress,
    text: `You have been invited to use Leave Me Alone by ${organisationName}.\n\nLeave Me Alone is a service to easily unsubscribe from subscription emails. As a member of the ${organisationName} organisation you can unsubscribe from as many unwanted subscription emails as you like. Simply sign-up or log-in using the following invite link and this email address to start unsubscribing now.\n\nAccept this invite:\n\n${baseUrl}/i/${inviteCode}\n\n${SIGN_OFF}`
  });
}

export function sendReferralInviteMail({
  toAddress,
  referrer,
  referralCode,
  reward
}) {
  logger.info('email-utils: sending invite mail');
  return sendTransactionalMail({
    from: `Leave Me Alone <noreply@${domains.transactional}>`,
    subject: `You have been invited to use Leave Me Alone`,
    to: toAddress,
    text: `You have been invited to use Leave Me Alone by ${referrer}.\n\nLeave Me Alone is a service to easily unsubscribe from subscription emails. With this referral link you will get ${reward} free credits to get started! Simply sign-up using the following referral link to start unsubscribing.\n\nSign-up now:\n\n${baseUrl}/r/${referralCode}\n\n${SIGN_OFF}`
  });
}

export function sendTransactionalMail(options) {
  return sendMail(options, transactionalTransport);
}
