import { get, remove, set, update } from '../dao/imap';

import { v4 } from 'node-uuid';

export function getImapAccessDetails(masterKey, accountId) {
  return get(accountId, masterKey);
}

export function setImapAccessDetails(masterKey, password) {
  const accountId = v4();
  return set(accountId, masterKey, password);
}

export function updateImapAccessDetails(accountId, masterKey, password) {
  return update(accountId, masterKey, password);
}

export function removeImapAccessDetails(accountId) {
  return remove(accountId);
}
