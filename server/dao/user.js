import db from './db';

const COL_NAME = 'users';

export async function createUser(data) {
  try {
    const col = await db.collection(COL_NAME);
    await col.insertOne(data);
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
    const user = await col.findOne({ id });
    console.log(`users-dao: fetched user ${id}`);
    return user;
  } catch (err) {
    console.error('users-dao: error fetching user');
    console.error(err);
    throw err;
  }
}
