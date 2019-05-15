import { getGmailAccessToken, getMailClient } from './access';
import { getSearchString, getTimeRange } from './utils';

import { URLSearchParams } from 'url';
import axios from 'axios';
import { dedupeMailList } from '../common';
import { getEstimateForTimeframe } from './estimator';
import httpMessageParser from 'http-message-parser';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';

// todo convert to generator?
export async function* fetchMail(
  { user, account, timeframe },
  { strategy = 'api', batch = false } = {}
) {
  const start = Date.now();
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, client, accessToken] = await Promise.all([
      getEstimateForTimeframe(account, {
        timeframe,
        includeTrash: true
      }),
      getMailClient(account, strategy),
      getGmailAccessToken(account)
    ]);
    logger.info(
      `gmail-fetcher: started ${timeframe} scan (${
        user.id
      }) [estimated ${totalEstimate} mail]`
    );
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];

    for await (let mail of fetchMailApi(client, {
      accessToken,
      timeframe,
      batch
    })) {
      totalEmailsCount = totalEmailsCount + mail.length;
      progress = progress + mail.length;
      const unsubscribableMail = parseMailList(mail, {
        ignoredSenderList,
        unsubscriptions
      });
      const previouslyUnsubbedCount = unsubscribableMail.filter(
        sm => !sm.subscribed
      ).length;
      totalPrevUnsubbedCount = totalPrevUnsubbedCount + previouslyUnsubbedCount;

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
      yield { type: 'progress', data: { progress, total: totalEstimate } };
    }

    logger.info(
      `gmail-fetcher: finished ${timeframe} scan (${
        user.id
      }) [took ${(Date.now() - start) / 1000}s, ${totalEmailsCount} results]`
    );
    return {
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount,
      occurrences: dupeCache,
      dupeSenders
    };
  } catch (err) {
    logger.error('gmail-fetcher: failed to fetch mail');
    logger.error(err);
    throw err;
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

async function* fetchMailApi(
  client,
  { accessToken, timeframe, batch = true, perPage = 100 }
) {
  let pageToken;
  try {
    const { then, now } = getTimeRange(timeframe);
    const query = getSearchString({
      then,
      now
    });
    const fields = 'nextPageToken';
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
      let populatedMessages;
      // sometimes the last page or the first page
      // wont have any messages
      if (!messages.length) {
        continue;
      }
      if (batch) {
        populatedMessages = await fetchMessagesBatch(
          accessToken,
          messages.map(m => m.id)
        );
      } else {
        populatedMessages = await Promise.all(
          messages.map(m => fetchMessageById(client, { id: m.id }))
        );
      }
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
    // labelIds: ['INBOX'],
    pageToken,
    qs: {
      fields,
      maxResults: perPage
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
    metadataHeaders: ['from', 'to', 'list-unsubscribe', 'subject'],
    fields
  });
  return data;
}

const batchUrl = 'https://www.googleapis.com/batch/gmail/v1';

async function fetchMessagesBatch(accessToken, messageIds) {
  const boundary = 'leave-me-alone';

  let queryParams = new URLSearchParams({
    format: 'metadata',
    fields: 'id,internalDate,labelIds,payload/headers,snippet',
    metadataHeaders: 'from'
  }).toString();
  // google accepts metadataHeaders in a weird fucking way,
  // so we add that on after.
  queryParams = `${queryParams}&metadataHeaders=to&metadataHeaders=list-unsubscribe&metadataHeaders=subject`;

  let content = messageIds.map(id =>
    [
      `--${boundary}`,
      `Content-ID: ${id}`,
      `Content-Type: application/http`,
      ``,
      `GET https://www.googleapis.com/gmail/v1/users/me/messages/${id}?${queryParams}`,
      ``
    ].join('\n')
  );
  content = `${content.join('\n')}\n\n--${boundary}--`;
  try {
    const response = await axios.request({
      url: batchUrl,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/mixed; boundary=${boundary}`,
        Authorization: `Bearer ${accessToken}`,
        'Content-Length': content.length
      },
      data: content
    });
    const respJson = httpMessageParser(response.data);
    const messages = respJson.multipart.map(({ body }) => {
      const messageRaw = body.toString();
      const match = messageRaw.match(/Content-Length: (.+)/);
      if (!match) {
        logger.warn('gmail-fetcher: message raw has no content length');
        return null;
      }
      const contentLen = match[1];
      const content = messageRaw
        .substr(messageRaw.indexOf('{'), contentLen)
        .trim();
      return JSON.parse(content);
    });
    return messages.filter(m => m);
  } catch (err) {
    logger.error('gmail-fetcher: failed batch message request');
    logger.error(err);
    throw err;
  }
}
