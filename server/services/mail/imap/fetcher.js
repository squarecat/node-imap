import { getMailboxName, getMailboxes } from './mailboxes';

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
      `imap-fetcher: checking for new mail after ${new Date(from)} (${
        user.id
      }) [estimated ${0} mail]`
    );
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];

    const searchableMailboxes = await getMailboxes(client);

    // search all the mailboxes we can
    const iterators = searchableMailboxes.map(mailbox =>
      fetch(client, { mailbox, from })
    );

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
      `imap-fetcher: finished scan (${user.id}) [took ${(Date.now() - start) /
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

export async function* fetch(client, { mailbox, from }) {
  try {
    client.onerror = err => console.error(err);
    const mail = await readFromBox(client, mailbox, from);
    yield mail;
  } catch (err) {
    console.error(err);
  }
}

async function readFromBox(client, mailbox, from) {
  const openBox = util.promisify(client.openBox.bind(client));
  const search = util.promisify(client.search.bind(client));
  const closeBox = util.promisify(client.closeBox.bind(client));
  try {
    const { name, box, attribute } = mailbox;
    const mailboxName = getMailboxName(name, box);
    await openBox(mailboxName, true);
    console.log(`imap-fetcher: searching mail from ${attribute}`);
    const uuids = await search([
      'ALL',
      ['SINCE', from],
      ['HEADER', 'LIST-UNSUBSCRIBE', '']
    ]);
    if (!uuids.length) {
      return [];
    }
    const messages = await fetchUuids(client, uuids);
    await closeBox();
    return messages.map(m => ({ ...m, mailbox }));
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
      msg.on('error', err => {
        logger.error(err);
      });
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
