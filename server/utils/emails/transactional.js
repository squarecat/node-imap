import config from 'getconfig';
import logger from '../logger';
import mailgun from 'mailgun-js';
import { sendMail } from './index';

const apiKey = config.mailgun.apiKey;
const domains = config.mailgun.domains;
const baseUrl = config.urls.base;

const transactionalTransport = mailgun({
  apiKey,
  domain: domains.transactional
});

const giftMailOptions = {
  from: `Leave Me Alone <purchases@${domains.transactional}>`,
  subject: 'Thank you for purchasing a gift scan'
};

// const reminderMailOptions = {
//   from: `Leave Me Alone <reminders@${domains.transactional}>`
// };

// const referralMailOptions = {
//   from: `Leave Me Alone <referrals@${domains.transactional}>`
// };

const inviteOptions = {
  from: `Leave Me Alone <invites@${domains.transactional}>`
};

export function sendGiftCouponMultiMail({
  toAddress,
  scanPeriod,
  coupons,
  quantity = 1
}) {
  logger.info('email-utils: sending gift coupon multi mail');
  return sendTransactionalMail({
    ...giftMailOptions,
    subject: 'Thank you for purchasing gift scans',
    to: toAddress,
    text: `Thank you for purchasing ${quantity} gift scans for ${scanPeriod}. Your coupon codes are:\n\n${coupons
      .map(c => c)
      .join('\n')}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

export function sendGiftCouponMail({ toAddress, scanPeriod, coupon }) {
  logger.info('email-utils: sending gift coupon mail');
  return sendTransactionalMail({
    ...giftMailOptions,
    to: toAddress,
    text: `Thank you for purchasing a gift scan for ${scanPeriod}. Your coupon code is:\n\n${coupon}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

// export function sendReminderMail({ toAddress, reminderPeriod, coupon }) {
//   logger.info('email-utils: sending reminder mail');
//   return sendTransactionalMail({
//     ...reminderMailOptions,
//     subject: `Reminder 🕐 - it's been ${reminderPeriod} since your last scan`,
//     to: toAddress,
//     text: `You asked us to remind you to use Leave Me Alone again.\n\nIt's been ${reminderPeriod} since your last scan.\n\nKeep your inbox clean by scanning again now. Use the coupon ${coupon} for 10% off your next purchase.\n\nJames & Danielle\n\nLeave Me Alone`
//   });
// }

// export function sendReferralLinkUsedMail({
//   toAddress,
//   referralCount,
//   referralUrl
// }) {
//   logger.info('email-utils: sending referral link used mail');

//   let subject = 'Yay! 🎉 - someone used your referral link';
//   let text = `Just a little email to tell you that you're on your way to earning $5! 👏 Someone bought a scan using your referral link for the first time.\n\nKeep sharing to get rewarded!\n\nYour referral URL is...\n\n${referralUrl}\n\nJames & Danielle\n\nLeave Me Alone\n\nYou're receiving this email because you shared your referral link for Leave Me Alone. We will only send you an email when you get another referrer and when you earn a reward.`;

//   if (referralCount === 2) {
//     subject = "You've referred 2 people 🙌 - just one more until payday!";
//     text = `Another person just purchased a scan using your referral link 🎉.\n\nYou're one ONE referral away from earning $5! Keep sharing your link.\n\nYour referral URL is...\n\n${referralUrl}\n\nJames & Danielle\n\nLeave Me Alone\n\nYou're receiving this email because you shared your referral link for Leave Me Alone. We will only send you an email to let you know when you earn a reward.`;
//   }

//   return sendTransactionalMail({
//     ...referralMailOptions,
//     to: toAddress,
//     subject,
//     text
//   });
// }

// export function sendReferralRewardMail({
//   toAddress,
//   rewardCount,
//   referralUrl
// }) {
//   logger.info('email-utils: sending referral reward mail');

//   let subject = "You've earned your first $5! 🎁";
//   let text = `Congratulations! You've just earned your first $5. Cash out at https://leavemealone.xyz/app\n\n3 people have cleaner inboxes because of you ❤️. Keep sharing your link to earn more $$$ and help more people.\n\nYour referral URL is...\n\n${referralUrl}\n\nJames & Danielle\n\nLeave Me Alone\n\nYou're receiving this email because you earned a reward from the Leave Me Alone referral program.`;

//   if (rewardCount > 1) {
//     subject = "You've earned another $5! 🎁";
//     text = `Congratulations! You've just earned another $5. Cash out at https://leavemealone.xyz/app\n\nThis brings your total to $${rewardCount *
//       5} earned and ${rewardCount *
//       3} people have cleaner inboxes because of you ❤️. Keep sharing your link to earn more $$$ and help more people.\n\nYour referral URL is...\n\n${referralUrl}\n\nJames & Danielle\n\nLeave Me Alone\n\n.You're receiving this email because you earned a reward from the Leave Me Alone referral program.`;
//   }
//   return sendTransactionalMail({
//     ...referralMailOptions,
//     to: toAddress,
//     subject,
//     text
//   });
// }

export function sendInviteMail({ toAddress, organisationName, inviteCode }) {
  logger.info('email-utils: sending invite mail');
  return sendTransactionalMail({
    ...inviteOptions,
    subject: `${organisationName} has invited you to use Leave Me Alone`,
    to: toAddress,
    text: `You have been invited to use Leave Me Alone by ${organisationName}.\n\nLeave Me Alone is a service to easily unsubscribe from spam emails. As a member of the ${organisationName} organisation you can unsubscribe from as many unwanted subscription emails as you like. Simply sign-up or log-in using the following invite link and this email address to start unsubscribing now.\n\nAccept this invite:\n\n${baseUrl}/i/${inviteCode}\n\nJames & Danielle\n\nLeave Me Alone`
  });
}

export function sendTransactionalMail(options) {
  return sendMail(options, transactionalTransport);
}
