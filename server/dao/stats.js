import db from './db';

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
