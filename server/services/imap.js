import { get, set } from '../dao/imap';

export function getImapAccessDetails(master, accountId) {
  return get(master, accountId);
}

export function setImapAccessDetails(master, accountData) {
  return set(master, accountData);
}
