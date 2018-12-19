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
export function addPaymentToStats({ price }) {
  return addPayment({ price });
}
export function addGiftPaymentToStats({ price }, count) {
  return addGiftPayment({ price }, count);
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
