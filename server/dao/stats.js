import db, { isoDate } from './db';

import _get from 'lodash.get';
import _omit from 'lodash.omit';
import { getProviderStats } from './user';
import logger from '../utils/logger';

const COL_NAME = 'stats';

export function addUnsubscriptionByLink(count = 1) {
  return addUnsubscription('unsubscriptionsByLinkStrategy', count);
}
export function addUnsubscriptionByEmail(count = 1) {
  return addUnsubscription('unsubscriptionsByMailtoStrategy', count);
}

async function addUnsubscription(type, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          unsubscriptions: count,
          [type]: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting stat unsubscription type ${type}`);
    logger.error(err);
    throw err;
  }
}

// export function addScan(count = 1) {
//   return updateSingleStat('scans', count);
// }

export function addFailedUnsubscription(count = 1) {
  return updateSingleStat('unsubscriptionsFailed', count);
}

export function addUser(count = 1) {
  return updateSingleStat('users', count);
}

export function addUserAccountDeactivated(count = 1) {
  return updateSingleStat('usersDeactivated', count);
}

export function addGiftRedemption(count = 1) {
  return updateSingleStat('giftRedemptions', count);
}

export function addEstimate(count = 1) {
  return updateSingleStat('estimates', count);
}

export function addReminderRequest(count = 1) {
  return updateSingleStat('remindersRequested', count);
}

export function addReminderSent(count = 1) {
  return updateSingleStat('remindersSent', count);
}

export function addReferralSignup(count = 1) {
  return updateSingleStat('referralSignupV2', count);
}
export function addReferralPurchase(count = 1) {
  return updateSingleStat('referralPurchaseV2', count);
}
export function addReferralPaidScan(count = 1) {
  return updateSingleStat('referralPaidScan', count);
}
export function addNewsletterUnsubscription(count = 1) {
  return updateSingleStat('newsletterUnsubscription', count);
}
export function addUnsubStatus(status) {
  if (status === 'rejected') {
    return updateSingleStat('failedEmailUnsubscribes');
  }
  if (status === 'delivered') {
    return updateSingleStat('successfulEmailUnsubscribes');
  }
}
export function addOrganisation(count = 1) {
  return updateSingleStat('organisations', count);
}
export function addOrganisationUser(count = 1) {
  return updateSingleStat('organisationUsers', count);
}
export function removeOrganisationUser(count = -1) {
  return updateSingleStat('organisationUsers', count);
}
export function addOrganisationUnsubscribe(count = 1) {
  return updateSingleStat('organisationUnsubscribes', count);
}
export function addConnectedAccount(provider, count = 1) {
  if (provider === 'google') {
    return updateSingleStat('connectedAccountGoogle', count);
  }
  if (provider === 'outlook') {
    return updateSingleStat('connectedAccountOutlook', count);
  }
  if (provider === 'imap') {
    return updateSingleStat('connectedAccountImap', count);
  }
}

// generic update stat function for anything
export async function updateSingleStat(statName, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          [statName]: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting stat ${statName}`);
    logger.error(err);
    throw err;
  }
}

export async function addNumberofEmails({
  totalEmails = 0,
  totalUnsubscribableEmails = 0,
  totalPreviouslyUnsubscribedEmails = 0
}) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          emails: totalEmails,
          unsubscribableEmails: totalUnsubscribableEmails,
          previouslyUnsubscribedEmails: totalPreviouslyUnsubscribedEmails
        }
      }
    );
  } catch (err) {
    logger.error(
      'stats-dao: error inserting stat total emails and total unsubscribable emails'
    );
    logger.error(err);
    throw err;
  }
}

export async function addPayment({ price }, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          totalRevenue: price,
          totalSales: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting payment stat ${price}`);
    logger.error(err);
    throw err;
  }
}

export async function addPackage({ credits }, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          creditsPurchased: credits,
          packagesPurchased: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting package stat ${credits}`);
    logger.error(err);
    throw err;
  }
}

export async function addRefund({ price }, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          totalRevenueRefunded: price,
          totalSalesRefunded: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting refund stat ${price}`);
    logger.error(err);
    throw err;
  }
}

export async function addGiftPayment({ price }, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          giftRevenue: price,
          giftSales: count
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting payment stat ${price}`);
    logger.error(err);
    throw err;
  }
}

export async function addCreditsRewarded(credits) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          creditsRewarded: credits
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting reward ${credits}`);
    logger.error(err);
    throw err;
  }
}

export async function getStats() {
  try {
    const col = await db().collection(COL_NAME);
    const stats = await col.findOne();
    // const providerStats = await getProviderStats();
    return stats;
    // {
    //   ...stats,
    //   ...providerStats
    // };
  } catch (err) {
    logger.error('stats-dao: failed to get stats');
    logger.error(err);
    throw err;
  }
}

const recordedStats = [
  'users',
  // 'scans',
  'estimates',
  'unsubscriptions',
  'emails',
  'unsubscribableEmails',
  'previouslyUnsubscribedEmails',
  'unsubscriptionsFailed',
  'unsubscriptionsByMailtoStrategy',
  'unsubscriptionsByLinkStrategy',
  'totalRevenue',
  'totalSales',
  'totalRevenueRefunded',
  'totalSalesRefunded',
  'giftRevenue',
  'giftSales',
  'giftRedemptions',
  'usersDeactivated',
  'remindersRequested',
  'remindersSent',
  'referralSignupV2',
  'referralPaidScan',
  'referralPurchaseV2',
  'newsletterUnsubscription',
  'failedEmailUnsubscribes',
  'successfulEmailUnsubscribes',
  'organisations',
  'organisationUsers',
  'organisationUnsubscribes',
  'creditsRewarded',
  'creditsPurchased',
  'packagesPurchased',
  'connectedAccountGoogle',
  'connectedAccountOutlook',
  'connectedAccountImap'
];

export async function recordStats() {
  const allStats = await getStats();

  let yesterdayTotals = _get(allStats, 'daily.previousDayTotals', {});
  // calc today stats
  const today = {
    timestamp: isoDate(),
    ...recordedStats.reduce((out, stat) => {
      return {
        ...out,
        [stat]: (allStats[stat] || 0) - (yesterdayTotals[stat] || 0)
      };
    }, {})
  };

  const col = await db().collection(COL_NAME);
  // insert today total
  await col.updateOne(
    {},
    { $set: { 'daily.previousDayTotals': _omit(allStats, 'daily') } }
  );
  await col.updateOne({}, { $push: { 'daily.histogram': today } });
}
