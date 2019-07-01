import { doRequest, getOutlookAccessToken } from './access';

import { dedupeMailList } from '../common';
import { getEstimateForTimeframe } from './estimator';
import { getSearchString } from './utils';
import logger from '../../../utils/logger';
import { parseMailList } from './parser';

export async function* fetchMail({ user, account, from }) {
  const start = Date.now();
  try {
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, accessToken] = await Promise.all([
      getEstimateForTimeframe(user.id, account, {
        from,
        includeTrash: true
      }),
      getOutlookAccessToken(user.id, account)
    ]);
    let totalEmailsCount = 0;
    let totalUnsubCount = 0;
    let totalPrevUnsubbedCount = 0;
    let progress = 0;
    let dupeCache = {};
    let dupeSenders = [];
    logger.info(
      `outlook-fetcher: checking for new mail after ${getSearchString({
        from
      })} (${user.id}) [estimated ${totalEstimate} mail]`
    );
    // get the folders so we can associate them later
    const mailFolders = await getMailFolders(accessToken);
    for await (let mail of requestMail({
      accessToken,
      from
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
        const {
          dupes: newDupeCache,
          deduped,
          dupeSenders: newDupeSenders
        } = dedupeMailList(dupeCache, unsubscribableMail, dupeSenders);
        dupeCache = newDupeCache;
        dupeSenders = newDupeSenders;
        totalUnsubCount = totalUnsubCount + deduped.length;
        yield { type: 'mail', data: deduped };
      }
      yield { type: 'progress', data: { progress, total: totalEstimate } };
    }
    logger.info(
      `outlook-fetcher: finished scan (${user.id}) [took ${(Date.now() -
        start) /
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
    logger.error('outlook-fetcher: failed to fetch mail');
    logger.error(err);
    throw err;
  }
}

async function* requestMail({ accessToken, from }) {
  try {
    const query = getSearchString({
      from
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
