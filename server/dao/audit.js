import db from './db';

const COL_NAME = 'audit';

export async function addAction(action) {
  const { type, userId, data } = action;
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({ type, userId, data });
  } catch (err) {
    console.error('users-dao: error inserting audit');
    console.error(err);
    throw err;
  }
}
