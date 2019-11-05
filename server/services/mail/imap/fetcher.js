import { MailError } from '../../../utils/errors';
import { createAudit } from '../../audit';
import { dedupeMailList } from './utils';
import { getMailClient } from './access';
import { getMailboxes } from './mailboxes';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';
import util from 'util';
import { appendScores } from '../common';

const histogram = io.histogram({
  name: 'IMAP Scan Time',
  measurement: 'mean'
});

export async function* fetchMail({
  masterKey,
  user,
  account,
  from,
  prevDupeCache
}) {
  const audit = createAudit(user.id, 'fetch/imap');
  const start = Date.now();
  let client;
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    logger.info(
      `imap-fetcher: checking for new mail after ${new Date(from)} (${
        user.id
      }) [estimated ${0} mail]`
    );
    audit.append(
      `Starting scan for mail on account ${account.email} ${
        from ? `after ${new Date(from)}` : ''
      }`
    );
    client = await getMailClient(masterKey, account, audit);
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = prevDupeCache;
    let dupeSenders = [];

    const searchableMailboxes = await getMailboxes(client);

    // search all the mailboxes we can
    const iterators = searchableMailboxes.map(mailbox =>
      fetch(client, { mailbox, from })
    );

    for (let iter of iterators) {
      yield {
        type: 'progress',
        data: {
          account: account.email,
          progress,
          total: searchableMailboxes.length
        }
      };
      progress = progress + 1;
      let next = await iter.next();
      while (!next.done) {
        const mail = next.value;
        totalEmailsCount = totalEmailsCount + mail.length;

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
            seenMail,
            newMail,
            dupeSenders: newDupeSenders
          } = dedupeMailList(dupeCache, unsubscribableMail, dupeSenders);
          const newSubscriptions = await appendScores(newMail);
          totalUnsubCount = totalUnsubCount + newMail.length;
          dupeCache = newDupeCache;
          dupeSenders = newDupeSenders;
          yield {
            type: 'mail',
            data: {
              duplicateSubscriptions: seenMail,
              newSubscriptions
            }
          };
        }
        next = await iter.next();
      }
    }
    const timeTaken = (Date.now() - start) / 1000;
    yield {
      type: 'progress',
      data: {
        account: account.email,
        progress: searchableMailboxes.length || 1,
        total: searchableMailboxes.length || 1
      }
    };
    logger.info(
      `imap-fetcher: finished scan (${user.id}) [took ${timeTaken /
        60} minutes, ${totalEmailsCount} results]`
    );
    audit.append(
      `Scan finished on account ${
        account.email
      }. ${totalUnsubCount} subscriptions found. [took ${timeTaken /
        60} minutes]`
    );

    histogram.update(timeTaken);

    return {
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount,
      occurrences: dupeCache,
      dupeSenders
    };
  } catch (err) {
    logger.error(err);
    throw new MailError('failed to fetch mail', {
      provider: 'imap',
      cause: err
    });
  } finally {
    if (client) {
      client.destroy();
    }
  }
}

export async function* fetch(client, { mailbox, from }) {
  try {
    client.onerror = err => console.error(err);

    const iter = readFromBox(client, mailbox, from);
    let next = await iter.next();
    while (!next.done) {
      const mail = next.value;
      yield mail;
      next = await iter.next();
    }
  } catch (err) {
    console.error(err);
  }
}

async function* readFromBox(client, mailbox, from) {
  const openBox = util.promisify(client.openBox.bind(client));
  const search = util.promisify(client.search.bind(client));
  const closeBox = util.promisify(client.closeBox.bind(client));
  const sort = util.promisify(client.sort.bind(client));
  let box;
  try {
    const { attribute, path } = mailbox;
    box = await openBox(path, true);
    console.log(`imap-fetcher: searching mail from ${attribute || path}`);
    const supportsSort = client.serverSupports('SORT');
    let uuids;
    let searchParams = ['BODY', 'unsubscribe'];
    if (client._config.host !== 'imap.mail.me.com') {
      // fixme, implement body searching for all mailboxes
      // searchParams = ['OR', searchParams, ['HEADER', 'LIST-UNSUBSCRIBE', '']];
      searchParams = ['HEADER', 'LIST-UNSUBSCRIBE', ''];
    }
    const query = ['ALL', ['SINCE', from], searchParams];
    if (supportsSort) {
      uuids = await sort(['-DATE'], query);
    } else {
      uuids = await search(query);
    }
    if (!uuids.length) {
      return [];
    }

    const pageSize = 100;
    const uuidPages = uuids.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / pageSize);
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = [];
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
    const iterators = uuidPages.map(page => fetchUuids(client, page));
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const mail = next.value;
        yield mail.map(m => ({ ...m, mailbox }));
        next = await iter.next();
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    if (box) {
      await closeBox();
    }
  }
}

async function* fetchUuids(client, uuids) {
  console.log(`fetching ${uuids.length} messages`);
  const f = client.fetch(uuids, {
    markSeen: false,
    bodies: 'HEADER.FIELDS (From To Subject List-Unsubscribe)'
  });

  const iter = iterator(f);
  let next = await iter.next();
  while (!next.done) {
    const message = next.value;
    yield message;
    next = await iter.next();
  }
}

async function getMessage(message) {
  return new Promise((resolve, reject) => {
    let e = {
      body: ''
    };
    message.on('error', err => {
      console.error(err);
      reject(err);
    });
    message.on('body', async stream => {
      stream.on('data', function(data) {
        e = {
          ...e,
          body: `${e.body}${data.toString('utf8')}`
        };
      });
    });
    message.once('attributes', ({ uid, flags, date }) => {
      e = { ...e, id: uid, flags, date };
    });
    message.once('end', () => {
      resolve(e);
    });
  });
}

async function* iterator(f) {
  let messages = [];

  let done = false;
  const onEnd = () => {
    done = true;
  };
  const onMessage = async message => {
    const email = await getMessage(message);
    messages = [...messages, email];
  };
  f.on('end', onEnd);
  f.on('message', onMessage);

  async function iterateMessage() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(messages.splice(0, 20));
      }, 500);
    });
  }

  while (true) {
    const value = await iterateMessage();
    if (value.length) {
      yield value;
    }
    if (done && !messages.length) {
      return [];
    }
  }
}
