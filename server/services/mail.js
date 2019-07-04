import {
  addFailedUnsubscriptionToStats,
  addNumberofEmailsToStats,
  addUnsubscriptionToStats
} from './stats';
import {
  addResolvedUnsubscription,
  addUnresolvedUnsubscription
} from '../dao/subscriptions';

import { addOrUpdateOccurrences } from './occurrences';
import emailAddresses from 'email-addresses';
import { fetchMail as fetchMailFromGmail } from './mail/gmail';
import { fetchMail as fetchMailFromOutlook } from './mail/outlook';
import fs from 'fs';
import { getUserById } from './user';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';
import { resolveUnsubscription as resolveUserUnsubscription } from '../dao/user';
import subMonths from 'date-fns/sub_months';

export async function* fetchMail({ userId, accountFilters = [] }) {
  const user = await getUserById(userId, { withAccountKeys: true });
  let { accounts, preferences } = user;
  let accountScanData = [];
  let accountOccurrences = {};
  let dupes = [];
  // if account filters are provided then only fetch from those accounts
  // otherwise search from all accounts
  if (accountFilters.length) {
    accounts = accounts.reduce((out, ac) => {
      const filter = accountFilters.find(af => ac.id === af.id);
      if (!filter) return out;
      return [
        ...out,
        {
          ...ac,
          filter
        }
      ];
    }, []);
  }
  try {
    const iterators = await Promise.all(
      accounts.map(account => fetchMailByAccount({ account, user }))
    );
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const { value } = next;
        yield value;
        next = await iter.next();
      }
      const { scanData, occurrences, dupeSenders } = next.value;
      accountScanData = [...accountScanData, scanData];
      accountOccurrences = { ...accountOccurrences, ...occurrences };
      // collect dupe senders if this scan was from data
      // at least 6 months ago
      const { type } = scanData;
      if (type === 'full') {
        dupes = [...dupes, dupeSenders];
      }
    }

    if (preferences.occurrencesConsent) {
      addOrUpdateOccurrences(userId, dupes);
    }
    return {
      occurrences: accountOccurrences
    };
  } catch (err) {
    throw err;
  }
}

export async function* fetchMailByAccount({ user, account, ignore = false }) {
  const { provider, filter } = account;
  let { from } = filter;
  // from should be max 6 months
  const sixMonthsAgo = subMonths(Date.now(), 6);
  if (!from || sixMonthsAgo > from) {
    from = sixMonthsAgo;
  }
  let it;
  try {
    if (provider === 'google') {
      it = await fetchMailFromGmail(
        { user, account, from },
        { strategy: 'api', batch: true }
      );
    } else if (provider === 'outlook') {
      it = await fetchMailFromOutlook({ user, account, from });
    } else {
      throw new Error('mail-service unknown provider');
    }

    let next = await it.next();
    while (!next.done) {
      const { value } = next;
      if (value.type === 'mail') {
        yield {
          type: value.type,
          data: value.data.map(v => ({
            forAccount: account.email,
            provider,
            ...v
          }))
        };
      } else {
        yield value;
      }

      next = await it.next();
    }
    const {
      totalMail,
      totalUnsubscribableMail,
      totalPreviouslyUnsubscribedMail,
      occurrences,
      dupeSenders
    } = next.value;

    const scanData = {
      from,
      totalEmails: totalMail,
      totalUnsubscribableEmails: totalUnsubscribableMail,
      totalPreviouslyUnsubscribedMail,
      email: account.email,
      provider: account.provider,
      type: sixMonthsAgo === from ? 'full' : 'topup'
    };
    if (!ignore) {
      addNumberofEmailsToStats({
        totalEmails: totalMail,
        totalUnsubscribableEmails: totalUnsubscribableMail,
        totalPreviouslyUnsubscribedEmails: totalPreviouslyUnsubscribedMail
      });
    }

    return { scanData, occurrences, dupeSenders };
  } catch (err) {
    throw err;
  }
}

export async function copyImageToUsefulImages(userId, mailId) {
  const path = `${imageStoragePath}/${userId}/${mailId}.png`;
  const usefulPath = `${imageStoragePath}/useful/${mailId}.png`;

  return new Promise((good, bad) => {
    fs.copyFile(path, usefulPath, err => {
      if (err) return bad(err);
      good();
    });
  });
}

export async function addUnsubscribeErrorResponse(
  { mailId, success, from, useImage, reason = null, unsubStrategy },
  userId
) {
  try {
    if (useImage) {
      await copyImageToUsefulImages(userId, mailId);
    }
    const { domain } = emailAddresses.parseOneAddress(from);
    if (success) {
      return Promise.all([
        addUnsubscriptionToStats({ unsubStrategy }),
        addResolvedUnsubscription({ mailId, domain, unsubStrategy, useImage }),
        resolveUserUnsubscription(userId, mailId)
      ]);
    }
    return Promise.all([
      addFailedUnsubscriptionToStats(),
      addUnresolvedUnsubscription({
        mailId,
        domain,
        reason,
        useImage,
        unsubStrategy
      }),
      resolveUserUnsubscription(userId, mailId)
    ]);
  } catch (err) {
    logger.error(
      `mail-service: error adding unsubscribe error response for mail ID ${mailId}`
    );
    logger.error(err);
    throw err;
  }
}

// export async function getMailEstimates(userId) {
//   const user = await getUserById(userId);
//   const { provider } = user;
//   let estimates;
//   try {
//     if (provider === 'google') {
//       estimates = await getMailEstimatesFromGmail(user);
//     } else if (provider === 'outlook') {
//       estimates = await getMailEstimatesFromOutlook(user);
//     } else {
//       throw new Error('mail-service unknown provider');
//     }
//     addEstimateToStats();
//     return estimates;
//   } catch (err) {
//     logger.error(
//       `mail-service: error getting mail estimates for user ${userId}`
//     );
//     logger.error(err);
//     throw err;
//   }
// }
