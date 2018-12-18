import {
  addUnsubscriptionByLink,
  addUnsubscriptionByEmail,
  addScan,
  addFailedUnsubscription,
  addNumberofEmails,
  addPayment,
  addGiftRedemption,
  addUser,
  addEstimate,
  getStats
} from '../dao/stats';

export function addUnsubscriptionToStats({ unsubStrategy = 'link' } = {}) {
  if (unsubStrategy === 'link') return addUnsubscriptionByLink();
  if (unsubStrategy === 'mailto') return addUnsubscriptionByEmail();
  return false;
}
export function addScanToStats() {
  return addScan();
}
export function addFailedUnsubscriptionToStats() {
  return addFailedUnsubscription();
}
export function addNumberofEmailsToStats(data) {
  return addNumberofEmails(data);
}
export function addUserToStats() {
  return addUser();
}
export function addPaymentToStats({ price, gift = false }) {
  return addPayment({ price, gift });
}
export function addGiftRedemptionToStats() {
  return addGiftRedemption();
}
export function addEstimateToStats() {
  return addEstimate();
}
export function getAllStats() {
  return getStats();
}
