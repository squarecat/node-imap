import db from './db';

const COL_NAME = 'stats';

export function addUnsubscription(count = 1) {
  try {
    const col = await db.collection(COL_NAME);
    await col.updateOne({ id }, {
      $inc: {
        unsubscriptions : count
      }
    });
  } catch (err) {
    console.error('users-dao: error inserting stat');
    console.error(err);
    throw err;
  }
}
