import { MailError } from '../../../utils/errors';
import { dedupeMailList } from '../common';
import { getMailClient } from './access';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';
import util from 'util';

export async function* fetchMail({ masterKey, user, account, from }) {
  const start = Date.now();
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    const client = await getMailClient(masterKey, account);
    logger.info(
      `gmail-fetcher: checking for new mail after ${new Date(from)} (${
        user.id
      }) [estimated ${0} mail]`
    );
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];

    const iterators = [fetch(client, { from })];
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const mail = next.value;
        totalEmailsCount = totalEmailsCount + mail.length;
        progress = progress + mail.length;

        const unsubscribableMail = parseMailList(mail, {
          ignoredSenderList,
          unsubscriptions
        });
        const previouslyUnsubbedCount = unsubscribableMail.filter(
          sm => !sm.subscribed
        ).length;
        totalPrevUnsubbedCount =
          totalPrevUnsubbedCount + previouslyUnsubbedCount;

        if (unsubscribableMail.length) {
          const {
            dupes: newDupeCache,
            deduped,
            dupeSenders: newDupeSenders
          } = dedupeMailList(dupeCache, unsubscribableMail, dupeSenders);
          totalUnsubCount = totalUnsubCount + deduped.length;
          dupeCache = newDupeCache;
          dupeSenders = newDupeSenders;
          yield { type: 'mail', data: deduped };
        }
        yield { type: 'progress', data: { progress, total: 0 } };
        next = await iter.next();
      }
    }

    logger.info(
      `gmail-fetcher: finished scan (${user.id}) [took ${(Date.now() - start) /
        1000}s, ${totalEmailsCount} results]`
    );
    return {
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount,
      occurrences: dupeCache,
      dupeSenders
    };
  } catch (err) {
    throw new MailError('failed to fetch mail', {
      provider: 'gmail',
      cause: err
    });
  }
}
export async function* fetch(client, { from }) {
  try {
    client.onerror = err => console.error(err);
    console.log('authenticating with imap');
    const key = 'body[header.fields (from to subject list-unsubscribe)]';
    const query = [
      'uid',
      'BODY.PEEK[HEADER.FIELDS (From To Subject List-Unsubscribe)]'
    ];
    const mail = await readFromBox(client, 'INBOX', from);

    yield mail;
    // const resultUUIDs = await client.search('INBOX', {
    //   since: from
    // });
    // let results = await client.listMessages(
    //   'INBOX',
    //   `${resultUUIDs[0]}:${resultUUIDs[resultUUIDs.length - 1]}`,
    //   query,
    //   {
    //     byUid: true,
    //     valueAsString: true
    //   }
    // );
    // results = results.map(r => {
    //   const headers = r[key].split('\r\n').filter(s => s);
    //   return {
    //     payload: { headers, snippet: '' },
    //     id: r.uid,
    //     labelIds: [],
    //     internalDate: Date.now()
    //   };
    // });
    // yield results;
  } catch (err) {
    console.error(err);
  }
}

async function readFromBox(client, mailboxName = 'INBOX', from) {
  const openBox = util.promisify(client.openBox.bind(client));
  const search = util.promisify(client.search.bind(client));
  const closeBox = util.promisify(client.closeBox.bind(client));
  const getBoxes = util.promisify(client.getBoxes.bind(client));
  try {
    await openBox(mailboxName, true);
    const boxes = await getBoxes();
    console.log(Object.keys(boxes));
    const uuids = await search([
      'ALL',
      ['SINCE', from],
      ['HEADER', 'LIST-UNSUBSCRIBE', '']
    ]);

    console.log('fetching mail from IMAP');
    const messages = await fetchUuids(client, uuids);
    await closeBox();
    return messages;
  } catch (err) {
    console.error(err);
  }
}

function fetchUuids(client, uuids) {
  return new Promise((resolve, reject) => {
    const f = client.fetch(uuids, {
      markSeen: false,
      bodies: 'HEADER.FIELDS (From To Subject List-Unsubscribe)'
    });
    let messages = [];
    f.on('message', msg => {
      let email = {
        body: ''
      };
      msg.on('body', async stream => {
        stream.on('data', function(data) {
          email = {
            ...email,
            body: `${email.body}${data.toString()}`
          };
        });
      });
      msg.once('attributes', ({ uid, flags, date }) => {
        email = { ...email, id: uid, flags, date };
      });
      msg.once('end', () => {
        messages = [...messages, email];
      });
    });
    f.once('error', err => {
      reject(err);
    });
    f.once('end', () => {
      resolve(messages);
    });
  });
}
