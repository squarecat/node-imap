import Agenda from 'agenda';
import _omit from 'lodash.omit';
import _get from 'lodash.get';

import db, { url as mongoUrl, isoDate } from './db';

const COL_NAME = 'stats';

export function addUnsubscriptionByLink(count = 1) {
  return addUnsubscription('unsubscriptionsByLinkStrategy', count);
}
export function addUnsubscriptionByEmail(count = 1) {
  return addUnsubscription('unsubscriptionsByMailtoStrategy', count);
}

async function addUnsubscription(type, count = 1) {
  console.log('stats-dao: adding unsubscribe stat', type, count);
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
    console.error('users-dao: error inserting stat unsubscription', type);
    console.error(err);
    throw err;
  }
}

export function addScan(count = 1) {
  return updateSingleStat('scans', count);
}

export function addFailedUnsubscription(count = 1) {
  return updateSingleStat('unsubscriptionsFailed', count);
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
    console.error('users-dao: error inserting stat', statName);
    console.error(err);
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
    console.error(
      'users-dao: error inserting stat total emails and total unsubscribable emails',
      totalEmails,
      totalUnsubscribableEmails
    );
    console.error(err);
    throw err;
  }
}

export async function getStats() {
  try {
    const col = await db().collection(COL_NAME);
    return await col.findOne();
  } catch (err) {
    console.error('users-dao: failed to get stats');
    console.error(err);
    throw err;
  }
}

const agenda = new Agenda({ db: { address: mongoUrl } });

agenda.define('record day stats', async (job, done) => {
  console.log('recording day stats');
  const allStats = await getStats();

  let yesterdayTotals = _get(allStats, 'daily.previousDayTotals', {});
  // calc today stats
  const today = {
    timestamp: isoDate(),
    scans: allStats.scans - (yesterdayTotals.scans || 0),
    unsubscriptions:
      allStats.unsubscriptions - (yesterdayTotals.unsubscriptions || 0),
    emails: allStats.emails - (yesterdayTotals.emails || 0),
    unsubscribableEmails:
      allStats.unsubscribableEmails -
      (yesterdayTotals.unsubscribableEmails || 0),
    previouslyUnsubscribedEmails:
      allStats.previouslyUnsubscribedEmails -
      (yesterdayTotals.unsubscribableEmails || 0),
    unsubscriptionsFailed:
      allStats.unsubscriptionsFailed -
      (yesterdayTotals.unsubscriptionsFailed || 0),
    unsubscriptionsByMailtoStrategy:
      allStats.unsubscriptionsByMailtoStrategy -
      (yesterdayTotals.unsubscriptionsByMailtoStrategy || 0),
    unsubscriptionsByLinkStrategy:
      allStats.unsubscriptionsByLinkStrategy -
      (yesterdayTotals.unsubscriptionsByLinkStrategy || 0)
  };
  const col = await db().collection(COL_NAME);
  // insert today total
  await col.updateOne(
    {},
    { $set: { 'daily.previousDayTotals': _omit(allStats, 'daily') } }
  );
  await col.updateOne({}, { $push: { 'daily.histogram': today } });
  done();
});

export async function recordStats() {
  console.log('starting agenda');
  const dailyReport = agenda.create('record day stats');
  await agenda.start();
  await dailyReport
    .repeatEvery('0 0 * * *', {
      skipImmediate: true,
      timezone: 'Etc/UTC'
    })
    .save();
}
