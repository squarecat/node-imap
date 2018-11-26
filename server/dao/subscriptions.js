import db from './db';

const COL_NAME = 'unsubscriptions';

export function addUnresolvedUnsubscription(data) {
  const { image, reason, domain } = data;
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({ domain, image, reason, resolved: false });
  } catch (err) {
    console.error('users-dao: error inserting unresolved unsubsription');
    console.error(err);
    throw err;
  }
}

export function addResolvedUnsubscription(data) {
  const { image, domain } = data;
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({ domain, image, resolved: true });
  } catch (err) {
    console.error('users-dao: error inserting resolved unsubsription');
    console.error(err);
    throw err;
  }
}