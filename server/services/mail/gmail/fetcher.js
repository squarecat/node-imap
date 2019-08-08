import { getGmailAccessToken, getMailClient } from './access';

import { MailError } from '../../../utils/errors';
import { URLSearchParams } from 'url';
import axios from 'axios';
import { dedupeMailList } from '../common';
import { getEstimateForTimeframe } from './estimator';
import { getSearchString } from './utils';
import httpMessageParser from 'http-message-parser';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';

// todo convert to generator?
export async function* fetchMail(
  { user, account, from },
  { strategy = 'api', batch = false } = {}
) {
  const start = Date.now();
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, client, accessToken] = await Promise.all([
      getEstimateForTimeframe(user.id, account, {
        from,
        includeTrash: true
      }),
      getMailClient(user.id, account, strategy),
      getGmailAccessToken(user.id, account)
    ]);
    logger.info(
      `gmail-fetcher: checking for new mail after ${new Date(from)} (${
        user.id
      }) [estimated ${totalEstimate} mail]`
    );
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];

    const iterators = [
      fetchMailApi(client, { accessToken, from, batch })
      // fetchMailApi(client, {
      //   accessToken,
      //   from,
      //   batch,
      //   withContent: true,
      //   query: 'unsubscribe'
      // })
    ];
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
        yield { type: 'progress', data: { progress, total: totalEstimate } };
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

async function* fetchMailApi(
  client,
  {
    accessToken,
    from,
    batch = true,
    perPage = 100,
    withContent = false,
    query = ''
  }
) {
  let pageToken;
  try {
    const q = getSearchString({
      from,
      query
    });
    const fields = 'nextPageToken';
    do {
      const response = await fetchPage(client, {
        fields,
        query: q,
        perPage,
        pageToken
      });
      const { data } = response;
      const { messages, nextPageToken } = data;
      pageToken = nextPageToken;
      let populatedMessages;
      // sometimes the last page or the first page
      // wont have any messages
      if (!messages || !messages.length) {
        continue;
      }
      if (batch) {
        populatedMessages = await fetchMessagesBatch(
          accessToken,
          messages.map(m => m.id),
          withContent
        );
      } else {
        // NOT USED, batch is currently always true
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
    pageToken,
    qs: {
      fields,
      maxResults: perPage
    }
  });

  return { data, nextPageToken };
}

// NOT USED
async function fetchMessageById(client, { id }) {
  const fields = 'id,internalDate,labelIds,payload/headers,snippet';
  const { data } = await client.users.messages.get({
    userId: 'me',
    id,
    format: 'full',
    metadataHeaders: ['from', 'to', 'list-unsubscribe', 'subject'],
    fields
  });
  return data;
}

const batchUrl = 'https://www.googleapis.com/batch/gmail/v1';

async function fetchMessagesBatch(
  accessToken,
  messageIds,
  withContent = false
) {
  const boundary = 'leave-me-alone';

  const format = withContent ? 'full' : 'metadata';
  let fields = 'id,internalDate,labelIds,snippet,payload/headers';
  if (withContent) {
    fields = `${fields},payload/parts`;
  }
  let queryParams = new URLSearchParams({
    format,
    fields,
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
