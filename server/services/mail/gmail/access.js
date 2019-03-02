import ImapClient from 'emailjs-imap-client';
import { auth } from 'getconfig';
import { getUserById } from '../../user';
import { google } from 'googleapis';
import isBefore from 'date-fns/is_before';
import { refreshAccessToken } from '../../../auth/google';
import subMinutes from 'date-fns/sub_minutes';

const { google: googleConfig } = auth;
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

export async function getMailClient(userOrUserId, type = 'api') {
  if (type === 'api') {
    return getApiClient(userOrUserId);
  } else {
    return getImapClient(userOrUserId);
  }
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

async function getImapClient(userOrUserId) {
  let user;
  if (typeof userOrUserId === 'string') {
    user = await getUserById(userOrUserId);
  } else {
    user = userOrUserId;
  }
  const xoauth2 = await getGmailAccessToken(user);
  const auth = {
    user: user.email,
    xoauth2
  };
  console.log('auth', auth);
  return new ImapClient('imap.gmail.com', 993, {
    logLevel: 'debug',
    auth,
    useSecureTransport: true
    // enableCompression: true
  });
}
