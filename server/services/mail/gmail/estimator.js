import { getMailClient } from './access';
import { getSearchString } from './utils';
import logger from '../../../utils/logger';

const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(
  account,
  { includeTrash = true, from } = {}
) {
  // addEstimateToStats();
  const estimate = await getEstimateForTimeframe(account, {
    includeTrash,
    from
  });
  return {
    ...estimate,
    totalSpam: (estimate.total * SPAM_REGULARITY).toFixed()
  };
}

// FIXME, not using timeframe data anymore so estimates suffer
// from the gmail api bug below
//
// due to issues with the Gmail API, to do
// an estimate for 1m or 6m, we have to
// estimate the estimate by multiplying it
export async function getEstimateForTimeframe(account, { includeTrash, from }) {
  const searchStr = getSearchString({
    from
  });
  let total = await getEstimatedEmails(searchStr, includeTrash, account);
  return total;
}

export async function getEstimatedEmails(query, includeTrash = true, account) {
  try {
    const client = await getMailClient(account);
    const { data } = await client.users.messages.list({
      userId: 'me',
      q: query,
      includeSpamTrash: includeTrash,
      // labelIds: ['INBOX'],
      qs: {
        fields: 'resultSizeEstimate'
      }
    });
    return data.resultSizeEstimate;
  } catch (err) {
    logger.error(
      `esimator: failed to estimate messages for user ${account.id || account}`
    );
    logger.error(err);
  }
}
