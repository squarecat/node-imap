import {
  addUnsubscriptionByLink,
  addUnsubscriptionByEmail,
  addScan,
  addFailedUnsubscription,
  addNumberofEmails,
  addPayment,
  addGiftPayment,
  addGiftRedemption,
  addUser,
  addEstimate,
  addReminderRequest,
  addReminderSent,
  addReferralSignup,
  addReferralPaidScan,
  addReferralCredit,
  getStats
} from '../dao/stats';

import { getUnsubscriptionsLeaderboard } from '../dao/user';

export function addUnsubscriptionToStats({ unsubStrategy = 'link' } = {}) {
  if (unsubStrategy === 'link') return addUnsubscriptionByLink();
  if (unsubStrategy === 'mailto') return addUnsubscriptionByEmail();
  return false;
}
export function addScanToStats(count) {
  return addScan(count);
}
export function addFailedUnsubscriptionToStats(count) {
  return addFailedUnsubscription(count);
}
export function addNumberofEmailsToStats(data) {
  return addNumberofEmails(data);
}
export function addUserToStats(count) {
  return addUser(count);
}
export function addPaymentToStats({ price }) {
  return addPayment({ price });
}
export function addGiftPaymentToStats({ price }, count) {
  return addGiftPayment({ price }, count);
}
export function addGiftRedemptionToStats(count) {
  return addGiftRedemption(count);
}
export function addEstimateToStats(count) {
  return addEstimate(count);
}
export function addReminderRequestToStats(count) {
  return addReminderRequest(count);
}
export function addReminderSentToStats(count) {
  return addReminderSent(count);
}
export function addReferralSignupToStats() {
  return addReferralSignup();
}
export function addReferralPaidScanToStats() {
  return addReferralPaidScan();
}
export function addReferralCreditToStats({ amount }) {
  return addReferralCredit({ amount });
}
export function getAllStats() {
  return getStats();
}
export function getLeaderboardStats() {
  return getUnsubscriptionsLeaderboard();
}
