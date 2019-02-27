import { getSearchString, getTimeRange } from './utils';

import { getMailClient } from './access';
import logger from '../../utils/logger';

const estimateTimeframes = ['3d', '1w'];
const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(
  userOrUserId,
  { includeTrash = true, timeframe } = {}
) {
  // addEstimateToStats();
  if (timeframe) {
    const estimate = await getEstimateForTimeframe(userOrUserId, {
      includeTrash,
      timeframe
    });
    return {
      ...estimate,
      totalSpam: (estimate.total * SPAM_REGULARITY).toFixed()
    };
  } else {
    let estimates = await Promise.all(
      estimateTimeframes.map(async tf => {
        const total = await getEstimateForTimeframe(userOrUserId, {
          includeTrash,
          tf
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

// due to issues with the Gmail API, to do
// an estimate for 1m or 6m, we have to
// estimate the estimate by multiplying it
export async function getEstimateForTimeframe(
  userOrUserId,
  { includeTrash, timeframe }
) {
  let tf = timeframe;
  let multiplier = 1;
  if (timeframe === '1m' || timeframe === '6m') {
    tf = '1w';
    multiplier = timeframe === '1m' ? 4 : 24;
  }
  const { then, now } = getTimeRange(tf);
  const searchStr = getSearchString({
    then,
    now
  });
  let total = await getEstimatedEmails(searchStr, includeTrash, userOrUserId);
  return total * multiplier;
}

export async function getEstimatedEmails(
  query,
  includeTrash = true,
  userOrUserId
) {
  try {
    const client = await getMailClient(userOrUserId);
    const { data } = await client.users.messages.list({
      userId: 'me',
      q: query,
      includeSpamTrash: includeTrash,
      labelIds: ['INBOX'],
      qs: {
        fields: 'resultSizeEstimate'
      }
    });
    return data.resultSizeEstimate;
  } catch (err) {
    logger.error(
      `esimator: failed to estimate messages for user ${userOrUserId.id ||
        userOrUserId}`
    );
    logger.error(err);
  }
}
