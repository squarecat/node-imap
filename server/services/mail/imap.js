import ImapClient from 'emailjs-imap-client';
import { getAccessToken } from './access';

export async function getClient(user) {
  const xoauth2 = await getAccessToken(user);
  const auth = {
    user: user.email,
    xoauth2
  };
  console.log('auth', auth);
  return new ImapClient('imap.gmail.com', 993, {
    logLevel: 'debug',
    auth,
    useSecureTransport: true,
    enableCompression: true
  });
}
