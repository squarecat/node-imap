import { doRequest, getOutlookAccessToken } from './access';
import { getFilterString, getSearchString } from './utils';

import { dedupeMailList } from '../common';
import { getEstimateForTimeframe } from './estimator';
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
      `outlook-fetcher: checking for new mail after ${getFilterString({
        from
      })} (${user.id}) [estimated ${totalEstimate} mail]`
    );
    // get the folders so we can associate them later
    const mailFolders = await getMailFolders(accessToken);
    const iterators = [
      requestMail({
        accessToken,
        from
      })
      // requestMail({
      //   accessToken,
      //   from,
      //   query: 'unsubscribe',
      //   withContent: true
      // })
    ];
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const mail = next.value;
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
        totalPrevUnsubbedCount =
          totalPrevUnsubbedCount + previouslyUnsubbedCount;

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
        next = await iter.next();
      }
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

async function* requestMail({
  accessToken,
  from,
  query = '',
  withContent = false
}) {
  try {
    let search;
    const filter = getFilterString({
      from
    });
    if (query) {
      search = getSearchString({
        from,
        query
      });
    }
    let page = 0;
    let limit = 100;
    do {
      const { value: data } = await request(accessToken, {
        filter,
        search,
        withContent,
        page,
        limit
      });
      if (!data.length) {
        break;
      }
      yield data;
      // no pages if withContent, so break after first page
      if (withContent) {
        break;
      }
      page = page + 1;
    } while (true);
  } catch (err) {
    logger.error('outlook-fetcher: failed to request mail', err.message);
    throw err;
  }
}

export async function request(
  accessToken,
  {
    search = '',
    filter,
    folder = 'AllItems',
    withContent = false,
    page = 0,
    limit = 100
  } = {}
) {
  try {
    return doRequest(
      getUrl({ search, filter, folder, page, limit, withContent }),
      accessToken
    );
  } catch (err) {
    logger.error('outlook-access: failed to send request to api', err.message);
    throw err;
  }
}

function getUrl({
  search,
  filter,
  folder = 'AllItems',
  page = 0,
  limit = 100,
  withContent = false
} = {}) {
  const url = [folder, 'messages'].join('/');
  let select =
    'from,toRecipients,subject,bodyPreview,ParentFolderId,id,internetMessageHeaders';
  if (withContent) {
    select = `${select},body`;
  }
  let args = [`$select=${select}`];
  if (search) {
    // You cannot use $filter or $orderby in a search request.
    // You can only get up to 250 results from a $search request.
    args = [...args, `$search=${search}`];
  } else {
    args = [
      ...args,
      `$filter=${filter}`,
      `$top=${limit}`,
      `$skip=${limit * page}`
    ];
  }
  return `${url}?${args.join('&')}`;
}

async function getMailFolders(accessToken) {
  const { value } = await doRequest('', accessToken);
  return value;
}
