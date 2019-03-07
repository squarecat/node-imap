import { getBetaUser } from '../utils/airtable';
import logger from '../utils/logger';

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
