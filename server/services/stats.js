import { addUnsubscription, addScan } from '../dao/stats';

export function addUnsubscriptionToStats() {
  return addUnsubscription();
}
export function addScanToStats() {
  return addScan();
}
