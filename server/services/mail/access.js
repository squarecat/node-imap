import { getUserById } from './user';
import { google } from 'googleapis';
import { google as googleConfig } from 'getconfig';
import isBefore from 'date-fns/is_before';
import { refreshAccessToken } from '../../auth';
import subMinutes from 'date-fns/sub_minutes';

export async function getGmailAccessToken(userOrUserId) {
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

export async function getMailClient(type = 'gmail', userOrUserId) {
  if (type === 'gmail') {
    const accessToken = await getGmailAccessToken(userOrUserId);
    const oauth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirect
    );
    oauth2Client.setCredentials({
      access_token: accessToken
    });
    return google.gmail({
      version: 'v1',
      auth: oauth2Client
    });
  } else {
    throw new Error('mail-access: client not supported yet');
  }
}

// export async function getLegacyMailClient(userOrUserId) {
//   const accessToken = await getGmailAccessToken(userOrUserId);
//   const gmail = new Gmail(accessToken);
//   return gmail;
// }
