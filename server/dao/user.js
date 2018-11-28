import db, { isoDate } from './db';
import { encrypt, decrypt } from './encryption';

const COL_NAME = 'users';
const encryptedUnsubCols = [
  'unsubscribeLink',
  'unsubscribeMailTo',
  'to',
  'from'
];

export async function createUser(data) {
  const { keys } = data;
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      ...data,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate(),
      keys: {
        refreshToken: encrypt(keys.refreshToken),
        accessToken: encrypt(keys.accessToken)
      },
      unsubscriptions: [],
      scans: []
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
    const col = await db().collection(COL_NAME);
    const user = await col.findOne({ id }, { fields: { _id: 0 } });
    if (!user) return null;
    const decryptedUser = {
      ...user,
      keys: {
        refreshToken: decrypt(user.keys.refreshToken),
        accessToken: decrypt(user.keys.accessToken)
      },
      unsubscriptions: user.unsubscriptions.map(unsub => {
        return Object.keys(unsub).reduce((out, k) => {
          if (encryptedUnsubCols.includes(k)) {
            return {
              ...out,
              [k]: decrypt(unsub[k])
            };
          }
          return {
            ...out,
            [k]: unsub[k]
          };
        });
      })
    };
    console.log(`users-dao: fetched user ${id}`);
    return decryptedUser;
  } catch (err) {
    console.error('users-dao: error fetching user');
    console.error(err);
    throw err;
  }
}

export async function updateUser(id, userData) {
  const { keys } = userData;
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: {
          ...userData,
          lastUpdatedAt: isoDate(),
          keys: {
            refreshToken: encrypt(keys.refreshToken),
            accessToken: encrypt(keys.accessToken)
          }
        }
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
  const data = Object.keys(mailData).reduce((out, k) => {
    if (encryptedUnsubCols.includes(k)) {
      return {
        ...out,
        [k]: encrypt(mailData[k])
      };
    }
    return {
      ...out,
      [k]: mailData[k]
    };
  });
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          unsubscriptions: { ...data, unsubscribedAt: isoDate() }
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

export async function addScan(id, scanData) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          scans: { ...scanData, scannedAt: isoDate() }
        }
      }
    );
    console.log(`users-dao: updated users scans ${id}`);
  } catch (err) {
    console.error('users-dao: error updating user scans');
    console.error(err);
    throw err;
  }
}
