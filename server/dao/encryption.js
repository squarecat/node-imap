import config from 'getconfig';
import aes256 from 'aes256';
import crypto from 'crypto';

const key = config.db.encryption.password;

export function encrypt(text) {
  if (!text) return text;
  return aes256.encrypt(key, text);
}

export function decrypt(text) {
  if (!text) return text;
  return aes256.decrypt(key, text);
}

export function hash(value) {
  return crypto
    .createHmac('sha256', key)
    .update(value)
    .digest('hex');
}

export function isHashEqual(hashedValue, unhashedValue) {
  return hash(unhashedValue) === hashedValue;
}
