import config from 'getconfig';
import aes256 from 'aes256';

const key = config.db.encryption.password;

export function encrypt(text) {
  if (!text) return text;
  return aes256.encrypt(key, text);
}

export function decrypt(text) {
  if (!text) return text;
  return aes256.decrypt(key, text);
}
