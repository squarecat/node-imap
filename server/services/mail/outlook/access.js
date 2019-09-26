import axios from 'axios';
import isBefore from 'date-fns/is_before';
import logger from '../../../utils/logger';
import { refreshAccessToken } from '../../../auth/outlook';
import subMinutes from 'date-fns/sub_minutes';

export const apiRootUrl = 'https://outlook.office.com/api/v2.0/me/MailFolders';

export async function getOutlookAccessToken(userId, account) {
  const { keys } = account;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken({ userId, account }, { refreshToken, expiresIn });
  }
  return accessToken;
}

export async function doRequest(url, token) {
  logger.debug(`outlook-access: fetching mail (${url})`);
  try {
    const reqOpts = {
      url: `${apiRootUrl}/${url}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const { status, data } = await axios.request(reqOpts);
    if (status !== 200) {
      throw new Error('outlook-access: failed requesting mail');
    }
    return data;
  } catch (err) {
    logger.error(`outlook-access: failed to send request to api (${url})`);
    if (err && err.response && err.response.data) {
      const { error } = err.response.data;
      throw new Error(`${error.code}: ${error.message}`);
    }
    throw new Error(err);
  }
}
