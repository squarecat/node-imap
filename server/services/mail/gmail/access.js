import { auth } from 'getconfig';
import { google } from 'googleapis';
import isBefore from 'date-fns/is_before';
import { refreshAccessToken } from '../../../auth/google';
import subMinutes from 'date-fns/sub_minutes';

const { google: googleConfig } = auth;
export async function getGmailAccessToken(account) {
  const { keys, id } = account;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken(id, { refreshToken, expiresIn });
  }
  return accessToken;
}

export async function getMailClient(account) {
  return getApiClient(account);
}

async function getApiClient(userOrUserId) {
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
