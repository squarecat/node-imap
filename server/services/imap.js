import { get, remove, set, update } from '../dao/imap';

import { testConnection } from './mail/imap/access';
import { v4 } from 'node-uuid';

export function getImapAccessDetails(accountId, masterKey) {
  return get(accountId, masterKey);
}

export async function setImapAccessDetails(masterKey, password) {
  const accountId = v4();
  await set(accountId, { masterKey, password });
  return accountId;
}

export function updateImapAccessDetails(accountId, { masterKey, password }) {
  return update(accountId, { masterKey, password });
}

export function removeImapAccessDetails(accountId) {
  return remove(accountId);
}

export function testImapConnection(account, audit) {
  return testConnection(account, audit);
}

export async function updateImapPassword({
  accountId,
  oldMasterKey,
  newMasterKey
}) {
  const password = await get(accountId, oldMasterKey);
  return updateImapAccessDetails(accountId, {
    masterKey: newMasterKey,
    password
  });
}
