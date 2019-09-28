import { differenceInCalendarWeeks, subWeeks } from 'date-fns';

import { getMailClient } from './access';
import { getSearchString } from './utils';

const SPAM_REGULARITY = 0.48;

export async function getMailEstimates(
  account,
  { includeTrash = true, from } = {}
) {
  const estimate = await getEstimateForTimeframe(account, {
    includeTrash,
    from
  });
  return {
    ...estimate,
    totalSpam: (estimate.total * SPAM_REGULARITY).toFixed()
  };
}

// due to issues with the Gmail API, to do an estimate
// for a long time we have to do an estimate for 1 week
// and then multiply it by the number we want
export async function getEstimateForTimeframe(userId, account, { from }) {
  let after;
  // get number of weeks between now and the from date
  const numWeeksOfSearch = differenceInCalendarWeeks(Date.now(), from);
  // if the number of weeks we're searching is < 1, then
  // just search that number, else search 1 week
  if (numWeeksOfSearch < 1) {
    after = from;
  } else {
    after = subWeeks(Date.now(), 1);
  }
  const searchStr = getSearchString({ from: after });
  let total = await getEstimatedEmails(searchStr, account, userId);
  // if the number of weeks was > 1 then we only searched 1 week
  // so multiple the result by the number of weeks to get the estimate
  if (numWeeksOfSearch > 1) {
    total = total * numWeeksOfSearch;
  }
  return total;
}

export async function getEstimatedEmails(query, account, userId) {
  try {
    const client = await getMailClient(userId, account);
    const { data } = await client.users.messages.list({
      userId: 'me',
      q: query,
      includeSpamTrash: true,
      qs: {
        fields: 'resultSizeEstimate'
      }
    });
    return data.resultSizeEstimate;
  } catch (err) {
    throw err;
  }
}
