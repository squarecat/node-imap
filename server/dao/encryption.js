import aes256 from 'aes256';
import config from 'getconfig';
import crypto from 'crypto';

import logger from '../utils/logger';

const key = config.db.encryption.password;

export function encrypt(text) {
  try {
    if (!text) return text;
    return aes256.encrypt(key, text);
  } catch (err) {
    logger.error('encryption: failed to encrypt value');
    logger.error(err);
    return text;
  }
}

export function decrypt(text) {
  try {
    if (!text) return text;
    return aes256.decrypt(key, text);
  } catch (err) {
    logger.error('encryption: failed to decrypt value');
    logger.error(err);
    return text;
  }
}

export function hash(value) {
  try {
    if (!value) return value;
    return crypto
      .createHmac('sha256', key)
      .update(value)
      .digest('hex');
  } catch (err) {
    logger.error('encryption: failed to hash value');
    logger.error(err);
    return value;
  }
}

export function isHashEqual(hashedValue, unhashedValue) {
  return hash(unhashedValue) === hashedValue;
}
