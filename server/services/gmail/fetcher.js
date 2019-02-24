import { getSearchString, getTimeRange, hasPaidScanAvailable } from './utils';

import { getEstimateForTimeframe } from './estimator';
import { getMailClient } from './access';
import logger from '../../utils/logger';
import { parseMailList } from './parser';

// todo convert to generator?
export async function fetchMail(
  { user, timeframe },
  { onMail, onError, onEnd, onProgress },
  { strategy = 'api', batch = false } = {}
) {
  try {
    if (!hasPaidScanAvailable(user, timeframe)) {
      logger.warn(
        'mail-service: User attempted search that has not been paid for'
      );
      return onError('Not paid');
    }
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, client] = await Promise.all([
      getEstimateForTimeframe(user, {
        timeframe,
        includeTrash: true
      }),
      getMailClient(user, strategy)
    ]);

    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    if (strategy === 'api') {
      for await (let mail of fetchMailApi(client, { timeframe, batch })) {
        console.log(`got ${mail.length} mail items!`);
        totalEmailsCount = totalEmailsCount + mail.length;
        progress = progress + mail.length;
        const unsubscribableMail = parseMailList(mail, {
          ignoredSenderList,
          unsubscriptions
        });
        totalUnsubCount = totalUnsubCount + unsubscribableMail.length;
        const previouslyUnsubbedCount = unsubscribableMail.filter(
          sm => !sm.subscribed
        ).length;
        totalPrevUnsubbedCount =
          totalPrevUnsubbedCount + previouslyUnsubbedCount;

        if (unsubscribableMail.length) {
          onMail(unsubscribableMail);
        }
        onProgress({ progress, total: totalEstimate });
      }
    } else if (strategy === 'imap') {
      for await (let mail of fetchMailImap(client, { timeframe })) {
        console.log(`got ${mail.length} mail items!`);
        totalEmailsCount = totalEmailsCount + mail.length;
        progress = progress + mail.length;
        const unsubscribableMail = parseMailList(mail, {
          ignoredSenderList,
          unsubscriptions
        });
        if (unsubscribableMail.length) {
          onMail(unsubscribableMail);
        }
        onProgress({ progress, total: totalEstimate });
      }
    }

    return onEnd({
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount
    });
  } catch (err) {
    onError(err);
  }
}

export async function* fetchMailImap(client, { timeframe }) {
  try {
    const { then } = getTimeRange(timeframe);
    client.onerror = err => console.error(err);
    console.log('authenticating with imap');
    await client.connect();
    const key = 'body[header.fields (from to subject list-unsubscribe)]';
    const query = [
      'uid',
      'BODY.PEEK[HEADER.FIELDS (From To Subject List-Unsubscribe)]'
    ];
    const resultUUIDs = await client.search('INBOX', {
      since: then
    });
    let results = await client.listMessages(
      'INBOX',
      `${resultUUIDs[0]}:${resultUUIDs[resultUUIDs.length - 1]}`,
      query,
      {
        byUid: true,
        valueAsString: true
      }
    );
    results = results.map(r => {
      const headers = r[key].split('\r\n').filter(s => s);
      return {
        payload: { headers, snippet: '' },
        id: r.uid,
        labelIds: [],
        internalDate: Date.now()
      };
    });
    yield results;
  } catch (err) {
    console.error(err);
  }
}

async function* fetchMailApi(client, { timeframe, perPage = 100 }) {
  let pageToken;
  try {
    const { then, now } = getTimeRange(timeframe);
    const query = getSearchString({
      then,
      now
    });
    const fields = 'nextPageToken';
    console.log(query);
    do {
      const response = await fetchPage(client, {
        fields,
        query,
        perPage,
        pageToken
      });
      const { data } = response;
      const { messages, nextPageToken } = data;
      pageToken = nextPageToken;
      const populatedMessages = await Promise.all(
        messages.map(m => fetchMessageById(client, { id: m.id }))
      );
      yield populatedMessages;
    } while (pageToken);
  } catch (err) {
    console.error('gmail-fetcher: failed to fetch mail');
    console.error(err);
    throw err;
  }
}

async function fetchPage(client, { fields, query, perPage, pageToken }) {
  const { data, nextPageToken } = await client.users.messages.list({
    userId: 'me',
    includeSpamTrash: true,
    q: query,
    qs: {
      fields,
      maxResults: perPage,
      pageToken
    }
  });
  return { data, nextPageToken };
}

async function fetchMessageById(client, { id }) {
  const fields = 'id,internalDate,labelIds,payload/headers,snippet';
  const { data } = await client.users.messages.get({
    userId: 'me',
    id,
    format: 'METADATA',
    metadataHeaders: ['from', 'to', 'list-unsubscribe'],
    fields
  });
  return data;
}
