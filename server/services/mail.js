import {
  addEstimateToStats,
  addFailedUnsubscriptionToStats,
  addNumberofEmailsToStats,
  addScanToStats,
  addUnsubscriptionToStats
} from './stats';
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

import { addOrUpdateOccurrences } from './occurrences';
import emailAddresses from 'email-addresses';
import fs from 'fs';
import { getUserById } from './user';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';

// todo convert to generator?
export async function* fetchMail({ userId, timeframe = '3d', ignore = false }) {
  const user = await getUserById(userId);
  const scannedAt = Date.now();
  const { provider } = user;
  let it;
  try {
    if (provider === 'google') {
      it = await fetchMailFromGmail(
        { user, timeframe },
        { strategy: 'api', batch: true }
      );
    } else if (provider === 'outlook') {
      it = await fetchMailFromOutlook({ user, timeframe });
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
      scannedAt,
      timeframe,
      totalEmails: totalMail,
      totalUnsubscribableEmails: totalUnsubscribableMail,
      totalPreviouslyUnsubscribedMail
    };
    if (!ignore) {
      addScanToStats();
      addNumberofEmailsToStats({
        totalEmails: totalMail,
        totalUnsubscribableEmails: totalUnsubscribableMail,
        totalPreviouslyUnsubscribedEmails: totalPreviouslyUnsubscribedMail
      });
      addScanToUser(user.id, scanData);
      if (timeframe !== '3d') {
        updatePaidScanForUser(userId, timeframe);
      }
    }
    addOrUpdateOccurrences(userId, dupeSenders, timeframe);

    return { ...scanData, occurrences };
  } catch (err) {
    console.error('mail-service: failed to fetch mail for user', user.id);
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
