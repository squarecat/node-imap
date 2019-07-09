import { auth } from 'getconfig';
import { google } from 'googleapis';
import isBefore from 'date-fns/is_before';
import { refreshAccessToken } from '../../../auth/google';
import subMinutes from 'date-fns/sub_minutes';

const { google: googleConfig } = auth;

export async function getGmailAccessToken(userId, account) {
  const { keys } = account;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken({ userId, account }, { refreshToken, expiresIn });
  }
  return accessToken;
}

export async function getMailClient(userId, account) {
  return getApiClient(userId, account);
}

async function getApiClient(userId, account) {
  const accessToken = await getGmailAccessToken(userId, account);
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
}

// async function getImapClient(userOrUserId) {
//   let user;
//   if (typeof userOrUserId === 'string') {
//     user = await getUserById(userOrUserId);
//   } else {
//     user = userOrUserId;
//   }
//   const xoauth2 = await getGmailAccessToken(user);
//   const auth = {
//     user: user.email,
//     xoauth2
//   };
//   console.log('auth', auth);
//   return new ImapClient('imap.gmail.com', 993, {
//     logLevel: 'debug',
//     auth,
//     useSecureTransport: true
//     // enableCompression: true
//   });
// }
