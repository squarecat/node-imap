import { getBetaUser } from '../utils/airtable';
import logger from '../utils/logger';

const REMEMBER_ME_FOR = 365 * 24 * 60; // 1 year

export async function isBetaUser({ email }) {
  try {
    const user = await getBetaUser({ email });
    if (user) return true;
    logger.debug('access: user is not in beta');
    return false;
  } catch (err) {
    logger.error('access: failed to determine if user is allowed');
    logger.error(err);
    throw err;
  }
}

export async function setRememberMeCookie(res, { username, provider }) {
  res.cookie('rememberMe', { username, provider }, { maxAge: REMEMBER_ME_FOR });
}
