import isBefore from 'date-fns/is_before';
import { refreshAccessToken } from '../../auth';
import subMinutes from 'date-fns/sub_minutes';

export function getAccessToken(user) {
  const { keys, id: userId } = user;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken(userId, { refreshToken, expiresIn });
  }
  return accessToken;
}
