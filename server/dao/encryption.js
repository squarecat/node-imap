// Nodejs encryption with CTR
import crypto from 'crypto';
import config from 'getconfig';

const algorithm = config.db.encryption.algorithm;
const password = config.db.encryption.password;

export function encrypt(text) {
  if (!algorithm) return text;
  if (!text) return text;
  var cipher = crypto.createCipher(algorithm, password);
  var crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
}

export function decrypt(text) {
  if (!algorithm) return text;
  if (!text) return text;
  var decipher = crypto.createDecipher(algorithm, password);
  var dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
