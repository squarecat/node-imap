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

export function hashPassword(
  password,
  salt = crypto.randomBytes(16).toString('hex')
) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, `sha512`)
    .toString(`hex`);
  return {
    salt,
    hash
  };
}

export function checkPassword(password, salt, hash) {
  const { hash: hashCheck } = hashPassword(password, salt);
  return hashCheck === hash;
}

export function decryptAccountTokens(accounts) {
  return accounts.map(account => ({
    ...account,
    keys: {
      ...account.keys,
      refreshToken: decrypt(account.keys.refreshToken),
      accessToken: decrypt(account.keys.accessToken)
    }
  }));
}

export function decryptUnsubscriptions(unsubscriptions, columns) {
  return unsubscriptions.map(unsub => {
    return Object.keys(unsub).reduce((out, k) => {
      if (columns.includes(k)) {
        return {
          ...out,
          [k]: decrypt(unsub[k])
        };
      }
      return {
        ...out,
        [k]: unsub[k]
      };
    }, {});
  });
}
