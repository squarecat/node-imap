import {
  addUnsubscription,
  addScan,
  addFailedUnsubscription,
  addNumberofEmails
} from '../dao/stats';

export function addUnsubscriptionToStats() {
  return addUnsubscription();
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
