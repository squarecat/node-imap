import config from 'getconfig';
import logger from '../logger';
import mailgun from 'mailgun-js';
import { sendMail } from './index';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;
const baseUrl = config.urls.base;

export const SIGN_OFF = `Thanks!\nJames & Danielle\nFounders of Leave Me Alone`;

const FROM_NAME = `Leave Me Alone <noreply@${domains.transactional}>`;

const transactionalTransport = mailgun({
  apiKey,
  domain: domains.transactional
});

export function sendOrganisationInviteMail({
  toAddress,
  organisationName,
  inviteCode
}) {
  logger.info('email-utils: sending org invite mail');
  return sendTransactionalMail({
    from: FROM_NAME,
    subject: `${organisationName} has invited you to use Leave Me Alone`,
    to: toAddress,
    text: `You have been invited to use Leave Me Alone by ${organisationName}.\n\nLeave Me Alone is a service to easily unsubscribe from subscription emails. As a member of the ${organisationName} organisation you can unsubscribe from as many unwanted subscription emails as you like. Simply sign-up or log-in using the following invite link and this email address to start unsubscribing now.\n\nAccept this invite:\n\n${baseUrl}/i/${inviteCode}\n\n${SIGN_OFF}`
  });
}

export function sendReferralInviteMail({
  toAddress,
  referrerName,
  referralCode,
  reward
}) {
  logger.info('email-utils: sending invite mail');
  let subject;
  let intro;
  if (referrerName) {
    subject = `${referrerName} has invited you to use Leave Me Alone`;
    intro = `You have been invited to use Leave Me Alone by ${referrerName}`;
  } else {
    subject = `You have been invited to use Leave Me Alone`;
    intro = `You have been invited to use Leave Me Alone`;
  }

  return sendTransactionalMail({
    from: FROM_NAME,
    subject,
    to: toAddress,
    text: `${intro}.\n\nLeave Me Alone is a service to easily unsubscribe from subscription emails. With this referral link you will get ${reward} free credits to get started! Simply sign-up using the following referral link to start unsubscribing.\n\nSign-up now:\n\n${baseUrl}/r/${referralCode}\n\n${SIGN_OFF}`
  });
}

export function sendReferralSignUpMail({
  toAddress,
  toName,
  referralUrl,
  refereeName,
  reward
}) {
  logger.info('email-utils: sending referral signup mail');

  const person = refereeName || 'Someone';
  let text = `${person} just signed up to Leave Me Alone using your referral link. You have earned ${reward} credits!\n\nLog in now and use your credits: ${baseUrl}/login\n\nKeep sharing your referral link to earn more credits: ${referralUrl}\n\nThank you for supporting Leave Me Alone and helping us grow.\n\n${SIGN_OFF}\n\n\n\nWe will stop notifying you by email when you reach 3 referrals.`;

  if (toName) {
    text = `${toName},\n\n${text}`;
  }

  return sendTransactionalMail({
    from: FROM_NAME,
    subject: `${person} just signed up through your referral link!`,
    to: toAddress,
    text
  });
}

export function sendReminderMail({
  toAddress,
  toName,
  reminderPeriod,
  coupon
}) {
  logger.info('email-utils: sending reminder mail');

  let text = `You set a reminder for your account (${toAddress}) on (${baseUrl}). It's been ${reminderPeriod} since you last unsubscribed from unwanted subscription emails.\n\nKeep your inbox clean by scanning again now. Use the coupon ${coupon} for 10% off your next purchase.\n\nHappy unsubscribing!\n\n${SIGN_OFF}`;

  if (toName) {
    text = `${toName},\n\n${text}`;
  }

  return sendTransactionalMail({
    from: FROM_NAME,
    subject: `Reminder: it's been ${reminderPeriod} since your last scan`,
    to: toAddress,
    text
  });
}

export function sendTransactionalMail(options) {
  return sendMail(options, transactionalTransport);
}
