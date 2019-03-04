import axios from 'axios';
import { getUserById } from '../../user';
import isBefore from 'date-fns/is_before';
import logger from '../../../utils/logger';
import { refreshAccessToken } from '../../../auth/outlook';
import subMinutes from 'date-fns/sub_minutes';

export const apiRootUrl = 'https://outlook.office.com/api/v2.0/me/MailFolders';

export async function getAccessToken(userOrUserId) {
  let user = userOrUserId;
  if (typeof userOrUserId === 'string') {
    user = await getUserById(userOrUserId);
  }

  const { keys } = user;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken(user.id, { refreshToken, expiresIn });
  }
  return accessToken;
}

export async function doRequest(url, token) {
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
      throw new Error('outlook-fetcher: failed requesting mail');
    }
    return data;
  } catch (err) {
    logger.error(`outlook-access: failed to send request to api (${url})`);
    const { response } = err;
    const { error } = response.data;
    throw new Error(`${error.code}: ${error.message}`);
  }
}
