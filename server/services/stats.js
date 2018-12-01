import {
  addUnsubscriptionByLink,
  addUnsubscriptionByEmail,
  addScan,
  addFailedUnsubscription,
  addNumberofEmails,
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

export function getAllStats() {
  return getStats();
}
