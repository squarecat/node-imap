import {
  addUnsubscriptionByLink,
  addUnsubscriptionByEmail,
  addScan,
  addFailedUnsubscription,
  addNumberofEmails,
  addPayment,
  addUser,
  addEstimate,
  getStats
} from '../dao/stats';

export function addUnsubscriptionToStats({ unsubStrategy }) {
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
export function addPaymentToStats(data) {
  return addPayment(data);
}
export function addEstimateToStats() {
  return addEstimate();
}
export function getAllStats() {
  return getStats();
}
