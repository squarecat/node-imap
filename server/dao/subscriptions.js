import db from './db';

const COL_NAME = 'unsubscriptions';

export async function addUnresolvedUnsubscription(data) {
  const { mailId, image, reason, domain } = data;
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({ mailId, domain, image, reason, resolved: false });
  } catch (err) {
    console.error('users-dao: error inserting unresolved unsubsription');
    console.error(err);
    throw err;
  }
}

export async function addResolvedUnsubscription(data) {
  const { mailId, image, domain } = data;
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({ mailId, domain, image, resolved: true });
  } catch (err) {
    console.error('users-dao: error inserting resolved unsubsription');
    console.error(err);
    throw err;
  }
}
