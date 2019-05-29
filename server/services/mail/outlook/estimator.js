import { doRequest, getAccessToken } from './access';
import { getSearchString, getTimeRange } from './utils';

import logger from '../../../utils/logger';

const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(account, { from } = {}) {
  // addEstimateToStats();
  const estimate = await getEstimateForTimeframe(account, {
    from
  });
  return {
    ...estimate,
    totalSpam: (estimate.total * SPAM_REGULARITY).toFixed()
  };
}

export async function getEstimateForTimeframe(account, { from }) {
  try {
    const query = getSearchString({
      from
    });
    return requestCount(account, { filter: query });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function requestCount(account, { filter, folder = 'AllItems' } = {}) {
  try {
    const accessToken = await getAccessToken(account);
    return doRequest(getCountUrl({ filter, folder }), accessToken);
  } catch (err) {
    logger.error('outlook-access: failed to send request to api');
    throw err;
  }
}

function getCountUrl({ filter, folder = 'AllItems' }) {
  const url = [folder, 'messages', '$count'].join('/');
  const args = [`$filter=${filter}`].join('&');
  return `${url}?${args}`;
}
