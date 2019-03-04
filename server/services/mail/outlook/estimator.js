import { doRequest, getAccessToken } from './access';
import { getSearchString, getTimeRange } from './utils';

import logger from '../../../utils/logger';

const estimateTimeframes = ['3d', '1w'];

const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(user, { timeframe } = {}) {
  // addEstimateToStats();
  if (timeframe) {
    const estimate = await getEstimateForTimeframe(user, {
      timeframe
    });
    return {
      ...estimate,
      totalSpam: (estimate.total * SPAM_REGULARITY).toFixed()
    };
  } else {
    let estimates = await Promise.all(
      estimateTimeframes.map(async tf => {
        const total = await getEstimateForTimeframe(user, {
          timeframe: tf
        });
        return {
          timeframe: tf,
          total
        };
      })
    );
    estimates = [
      ...estimates,
      { timeframe: '1m', total: estimates[1].total * 4 },
      { timeframe: '6m', total: estimates[1].total * 4 * 6 }
    ].map(e => ({ ...e, totalSpam: (e.total * SPAM_REGULARITY).toFixed() }));

    return estimates;
  }
}

export async function getEstimateForTimeframe(user, { timeframe }) {
  try {
    const { then, now } = getTimeRange(timeframe);
    const query = getSearchString({
      then,
      now
    });
    return requestCount(user, { filter: query });
  } catch (err) {
    logger.error(err);
    throw err;
  }
}

async function requestCount(user, { filter, folder = 'AllItems' } = {}) {
  try {
    const accessToken = await getAccessToken(user);
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
