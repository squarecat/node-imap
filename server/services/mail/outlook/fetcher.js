import { doRequest, getAccessToken } from './access';
import { getSearchString, getTimeRange, hasPaidScanAvailable } from './utils';

import { dedupeMailList } from '../common';
import { getEstimateForTimeframe } from './estimator';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';

export async function* fetchMail({ user, timeframe = '3d' }) {
  const start = Date.now();
  try {
    if (!hasPaidScanAvailable(user, timeframe)) {
      logger.warn(
        'mail-service: User attempted search that has not been paid for'
      );
      return { type: 'error', message: 'Not paid' };
    }
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, accessToken] = await Promise.all([
      getEstimateForTimeframe(user, {
        timeframe,
        includeTrash: true
      }),
      getAccessToken(user)
    ]);
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    logger.info(
      `outlook-fetcher: started ${timeframe} scan (${
        user.id
      }) [estimated ${totalEstimate} mail]`
    );
    // get the folders so we can associate them later
    const mailFolders = await getMailFolders(accessToken);
    for await (let mail of requestMail({
      accessToken,
      timeframe
    })) {
      totalEmailsCount = totalEmailsCount + mail.length;
      progress = progress + mail.length;
      let unsubscribableMail = parseMailList(mail, {
        ignoredSenderList,
        unsubscriptions,
        mailFolders
      });
      const previouslyUnsubbedCount = unsubscribableMail.filter(
        sm => !sm.subscribed
      ).length;
      totalPrevUnsubbedCount = totalPrevUnsubbedCount + previouslyUnsubbedCount;

      if (unsubscribableMail.length) {
        const { dupes: newDupeCache, deduped } = dedupeMailList(
          dupeCache,
          unsubscribableMail
        );
        dupeCache = newDupeCache;
        totalUnsubCount = totalUnsubCount + deduped.length;
        yield { type: 'mail', data: deduped };
      }
      yield { type: 'progress', data: { progress, total: totalEstimate } };
    }
    logger.info(
      `outlook-fetcher: finished ${timeframe} scan (${
        user.id
      }) [took ${(Date.now() - start) / 1000}s, ${totalEmailsCount} results]`
    );
    return {
      totalMail: totalEmailsCount,
      totalUnsubscribableMail: totalUnsubCount,
      totalPreviouslyUnsubscribedMail: totalPrevUnsubbedCount,
      occurrences: dupeCache
    };
  } catch (err) {
    logger.error('outlook-fetcher: failed to fetch mail');
    logger.error(err);
    throw err;
  }
}

async function* requestMail({ accessToken, timeframe }) {
  try {
    const { then, now } = getTimeRange(timeframe);
    const query = getSearchString({
      then,
      now
    });
    let page = 0;
    let limit = 100;
    do {
      const { value: data } = await request(accessToken, {
        filter: query,
        page,
        limit
      });
      if (!data.length) {
        break;
      }
      yield data;
      page = page + 1;
    } while (true);
  } catch (err) {
    logger.error('outlook-fetcher: failed to request mail', err.message);
    throw err;
  }
}

export async function request(
  accessToken,
  { filter, folder = 'AllItems', page = 0, limit = 100 } = {}
) {
  try {
    return doRequest(getUrl({ filter, folder, page, limit }), accessToken);
  } catch (err) {
    logger.error('outlook-access: failed to send request to api', err.message);
    throw err;
  }
}

function getUrl({ filter, folder = 'AllItems', page = 0, limit = 100 } = {}) {
  const url = [folder, 'messages'].join('/');
  const args = [
    `$top=${limit}`,
    `$skip=${limit * page}`,
    `$select=from,toRecipients,subject,bodyPreview,ParentFolderId,id,internetMessageHeaders`,
    `$filter=${filter}`
  ].join('&');
  return `${url}?${args}`;
}

async function getMailFolders(accessToken) {
  const { value } = await doRequest('', accessToken);
  return value;
}
