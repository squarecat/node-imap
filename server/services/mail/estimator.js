import { getSearchString, getTimeRange } from './utils';

import { getMailClient } from './access';

const estimateTimeframes = ['3d', '1w'];
const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(
  userOrUserId,
  { includeTrash = true, timeframe } = {}
) {
  addEstimateToStats();
  if (timeframe) {
    const estimate = getEstimateForTimeframe(userOrUserId, {
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
  let total = await getEstimatedEmails(searchStr, userOrUserId);
  if (includeTrash) {
    const trashSearchString = getSearchString({
      then,
      now,
      query: 'in:trash'
    });
    const trashTotal = await getEstimatedEmails(
      trashSearchString,
      userOrUserId
    );
    total = total + trashTotal;
  }

  return total * multiplier;
}

export async function getEstimatedEmails(query, userOrUserId) {
  const client = await getMailClient('gmail', userOrUserId);
  return new Promise((resolve, reject) => {
    client.estimatedMessages(
      query,
      {
        max: 1000,
        timeout: 5000
      },
      (err, count) => {
        if (err) {
          return reject(err);
        }
        return resolve(count);
      }
    );
  });
}
