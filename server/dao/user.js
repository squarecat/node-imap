import db, { isoDate } from './db';

const COL_NAME = 'users';

export async function createUser(data) {
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne({
      ...data,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate()
    });
    console.log(`users-dao: inserted user ${data.id}`);
    const user = await getUser(data.id);
    return user;
  } catch (err) {
    console.error('users-dao: error inserting user');
    console.error(err);
    throw err;
  }
}

export async function getUser(id) {
  try {
    const col = await db.collection(COL_NAME);
    const user = await col.findOne({ id }, { fields: { _id: 0 } });
    console.log(`users-dao: fetched user ${id}`);
    return user;
  } catch (err) {
    console.error('users-dao: error fetching user');
    console.error(err);
    throw err;
  }
}

export async function updateUser(id, userData) {
  try {
    const col = await db.collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: { ...userData, lastUpdatedAt: isoDate() }
      }
    );
    console.log(`users-dao: updated user ${id}`);
    const user = await getUser(id);
    return user;
  } catch (err) {
    console.error('users-dao: error updated user');
    console.error(err);
    throw err;
  }
}

export async function addUnsubscription(id, mailData) {
  try {
    const col = await db.collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          unsubscriptions: { ...mailData, unsubscribedAt: isoDate() }
        }
      }
    );
    console.log(`users-dao: updated users unsubscriptions ${id}`);
  } catch (err) {
    console.error('users-dao: error updating user unsubscriptions');
    console.error(err);
    throw err;
  }
}
