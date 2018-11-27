import db from './db';

const COL_NAME = 'stats';

export function addUnsubscription(count = 1) {
  return updateStat('unsubscriptions', count);
}

export function addScan(count = 1) {
  return updateStat('scans', count);
}

// generic update stat function for anything
async function updateStat(statName, count = 1) {
  try {
    const col = await db.collection(COL_NAME);
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
