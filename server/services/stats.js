import {
  addUnsubscription,
  addScan,
  addFailedUnsubscription
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
