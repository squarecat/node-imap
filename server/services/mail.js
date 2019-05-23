import {
  addEstimateToStats,
  addFailedUnsubscriptionToStats,
  addNumberofEmailsToStats,
  addScanToStats,
  addUnsubscriptionToStats
} from './stats';
import { addOrUpdateOccurrences, getOccurrenceScores } from './occurrences';
import {
  addResolvedUnsubscription,
  addUnresolvedUnsubscription
} from '../dao/subscriptions';
import {
  addScan as addScanToUser,
  resolveUnsubscription as resolveUserUnsubscription,
  updatePaidScan as updatePaidScanForUser
} from '../dao/user';
import {
  fetchMail as fetchMailFromGmail,
  getEstimates as getMailEstimatesFromGmail
} from './mail/gmail';
import {
  fetchMail as fetchMailFromOutlook,
  getEstimates as getMailEstimatesFromOutlook
} from './mail/outlook';

import emailAddresses from 'email-addresses';
import fs from 'fs';
import { getUserById } from './user';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';
import { updateOccurances } from '../dao/occurrences';

export async function* fetchMail({ userId }) {
  const user = await getUserById(userId);
  const { accounts } = user;
  let accountScanData = [];
  let accountOccurrences = [];
  console.log(accounts);
  try {
    const iterators = await Promise.all(
      accounts.map(account => fetchMailByAccount({ account, user }))
    );
    for (let iter of iterators) {
      let next = await iter.next();
      while (!next.done) {
        const { value } = next;
        console.log('yield account mail');
        yield value;
        console.log('yielded account mail');
        next = await iter.next();
      }
      const { scanData, occurrences, dupeSenders } = next.value;
      accountScanData = [...accountScanData, scanData];
      accountOccurrences = [...accountOccurrences, { email: occurrences }];
    }
    // addOrUpdateOccurrences(userId, dupeSenders, timeframe);
    // addScanToUser(user.id, scanData);
    return {
      occurrences: accountOccurrences
    };
  } catch (err) {
    console.error('mail-service: failed to fetch mail for user', user.id);
    throw err;
  }
}

export async function* fetchMailByAccount({
  user,
  account,
  timeframe = '1m',
  ignore = false
}) {
  const { provider } = account;
  let it;
  try {
    if (provider === 'google') {
      it = await fetchMailFromGmail(
        { user, account, timeframe },
        { strategy: 'api', batch: true }
      );
    } else if (provider === 'outlook') {
      it = await fetchMailFromOutlook({ user, account, timeframe });
    } else {
      throw new Error('mail-service unknown provider');
    }

    let next = await it.next();
    while (!next.done) {
      const { value } = next;
      yield value;
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
      timeframe,
      totalEmails: totalMail,
      totalUnsubscribableEmails: totalUnsubscribableMail,
      totalPreviouslyUnsubscribedMail,
      email: account.email,
      provider: account.provider
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
    console.error(err);
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

export async function getMailEstimates(userId) {
  const user = await getUserById(userId);
  const { provider } = user;
  let estimates;
  try {
    if (provider === 'google') {
      estimates = await getMailEstimatesFromGmail(user);
    } else if (provider === 'outlook') {
      estimates = await getMailEstimatesFromOutlook(user);
    } else {
      throw new Error('mail-service unknown provider');
    }
    addEstimateToStats();
    return estimates;
  } catch (err) {
    logger.error(
      `mail-service: error getting mail estimates for user ${userId}`
    );
    logger.error(err);
    throw err;
  }
}
