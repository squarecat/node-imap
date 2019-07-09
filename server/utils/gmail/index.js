import axios from 'axios';
import logger from '../logger';

const REVOKE_URL = 'https://accounts.google.com/o/oauth2/revoke';

export async function revokeToken(token) {
  try {
    const url = `${REVOKE_URL}?token=${token}`;
    await axios.get(url);
    return true;
  } catch (err) {
    logger.error('google-utils: error revoking token');
    if (
      err.response &&
      err.response.data &&
      err.response.data.error === 'invalid_token'
    ) {
      logger.error('google-utils: token already revoked');
      return true;
    } else {
      logger.error(err);
      throw err;
    }
  }
}
