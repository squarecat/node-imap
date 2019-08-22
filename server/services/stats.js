import {
  addConnectedAccount,
  addCreditsRewarded,
  addDonation,
  addEstimate,
  addFailedUnsubscription,
  addGiftPayment,
  addGiftRedemption,
  addInvoicePayment,
  addNewsletterUnsubscription,
  addNumberofEmails,
  addOrganisation,
  addOrganisationUnsubscribe,
  addOrganisationUser,
  addPackage,
  addPayment,
  addReferralPurchase,
  addReferralSignup,
  addRefund,
  addReminderRequest,
  addReminderSent,
  addUnsubStatus,
  addUnsubscriptionByEmail,
  addUnsubscriptionByLink,
  addUser,
  addUserAccountDeactivated,
  getStats,
  removeOrganisationUser
} from '../dao/stats';

import { getUnsubscriptionsLeaderboard } from '../dao/user';

export function addUnsubscriptionToStats({ unsubStrategy = 'link' } = {}) {
  if (unsubStrategy === 'link') return addUnsubscriptionByLink();
  if (unsubStrategy === 'mailto') return addUnsubscriptionByEmail();
  return false;
}
// export function addScanToStats(count) {
//   return addScan(count);
// }
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
export function addInvoicePaymentToStats({ price }) {
  return addInvoicePayment({ price });
}
export function addPackageToStats({ credits }) {
  return addPackage({ credits });
}
export function addRefundToStats({ price }) {
  return addRefund({ price });
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
export function addReferralPurchaseToStats() {
  return addReferralPurchase();
}
export function addUserAccountDeactivatedToStats(count) {
  return addUserAccountDeactivated(count);
}
export function addNewsletterUnsubscriptionToStats(count) {
  return addNewsletterUnsubscription(count);
}
export function addUnsubStatusToStats(status) {
  return addUnsubStatus(status);
}
export function addCreditsRewardedToStats(credits) {
  return addCreditsRewarded(credits);
}
export function addOrganisationToStats(count) {
  return addOrganisation(count);
}
export function addOrganisationUserToStats(count) {
  return addOrganisationUser(count);
}
export function removeOrganisationUserToStats(count) {
  return removeOrganisationUser(count);
}
export function addOrganisationUnsubscribeToStats(count) {
  return addOrganisationUnsubscribe(count);
}
export function addConnectedAccountToStats(provider) {
  return addConnectedAccount(provider);
}
export function addDonationToStats({ amount }) {
  return addDonation({ amount });
}

export function getAllStats() {
  return getStats();
}

export function getLeaderboardStats() {
  return getUnsubscriptionsLeaderboard();
}
