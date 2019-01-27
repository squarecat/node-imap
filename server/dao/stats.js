import _omit from 'lodash.omit';
import _get from 'lodash.get';

import db, { isoDate } from './db';
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
      },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting stat unsubscription type ${type}`);
    logger.error(err);
    throw err;
  }
}

export function addScan(count = 1) {
  return updateSingleStat('scans', count);
}

export function addFailedUnsubscription(count = 1) {
  return updateSingleStat('unsubscriptionsFailed', count);
}

export function addUser(count = 1) {
  return updateSingleStat('users', count);
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

// generic update stat function for anything
async function updateSingleStat(statName, count = 1) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      {},
      {
        $inc: {
          [statName]: count
        }
      },
      { upsert: true }
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
      },
      { upsert: true }
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
      },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting payment stat ${price}`);
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
      },
      { upsert: true }
    );
  } catch (err) {
    logger.error(`stats-dao: error inserting payment stat ${price}`);
    logger.error(err);
    throw err;
  }
}

export async function getStats() {
  try {
    const col = await db().collection(COL_NAME);
    return await col.findOne();
  } catch (err) {
    logger.error('stats-dao: failed to get stats');
    logger.error(err);
    throw err;
  }
}

export async function recordStats() {
  const allStats = await getStats();

  let yesterdayTotals = _get(allStats, 'daily.previousDayTotals', {});
  // calc today stats
  const today = {
    timestamp: isoDate(),
    users: allStats.users - (yesterdayTotals.users || 0),
    scans: allStats.scans - (yesterdayTotals.scans || 0),
    estimates: allStats.estimates - (yesterdayTotals.estimates || 0),
    unsubscriptions:
      allStats.unsubscriptions - (yesterdayTotals.unsubscriptions || 0),
    emails: allStats.emails - (yesterdayTotals.emails || 0),
    unsubscribableEmails:
      allStats.unsubscribableEmails -
      (yesterdayTotals.unsubscribableEmails || 0),
    previouslyUnsubscribedEmails:
      allStats.previouslyUnsubscribedEmails -
      (yesterdayTotals.previouslyUnsubscribedEmails || 0),
    unsubscriptionsFailed:
      allStats.unsubscriptionsFailed -
      (yesterdayTotals.unsubscriptionsFailed || 0),
    unsubscriptionsByMailtoStrategy:
      allStats.unsubscriptionsByMailtoStrategy -
      (yesterdayTotals.unsubscriptionsByMailtoStrategy || 0),
    unsubscriptionsByLinkStrategy:
      allStats.unsubscriptionsByLinkStrategy -
      (yesterdayTotals.unsubscriptionsByLinkStrategy || 0),
    totalRevenue: allStats.totalRevenue - (yesterdayTotals.totalRevenue || 0),
    totalSales: allStats.totalSales - (yesterdayTotals.totalSales || 0),
    giftRevenue: allStats.giftRevenue - (yesterdayTotals.giftRevenue || 0),
    giftSales: allStats.giftSales - (yesterdayTotals.giftSales || 0),
    giftRedemptions:
      allStats.giftRedemptions - (yesterdayTotals.giftRedemptions || 0)
  };
  const col = await db().collection(COL_NAME);
  // insert today total
  await col.updateOne(
    {},
    { $set: { 'daily.previousDayTotals': _omit(allStats, 'daily') } }
  );
  await col.updateOne({}, { $push: { 'daily.histogram': today } });
}
