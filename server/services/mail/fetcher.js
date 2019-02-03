import { getClient } from './imap';

export async function fetchMail(provider = 'gmail', user) {
  if (provider === 'gmail') {
    try {
      const client = await getClient(user);
      client.onerror = err => console.error(err);
      console.log('authenticating with imap');
      await client.connect();
      console.log('fetching');
      const results = await client.search('INBOX', {
        since: new Date(2019, 1, 1, 0, 0, 0)
      });
      console.log(results);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('unsupported client');
  }
}
