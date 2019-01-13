import db, { isoDate } from './db';
import { encrypt, decrypt } from './encryption';
import shortid from 'shortid';

const COL_NAME = 'users';
const encryptedUnsubCols = [
  'unsubscribeLink',
  'unsubscribeMailTo',
  'to',
  'from',
  'image'
];

export async function createUser(data) {
  const { keys } = data;
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      ...data,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate(),
      referralCode: shortid.generate(),
      referrals: [],
      keys: {
        refreshToken: encrypt(keys.refreshToken),
        accessToken: encrypt(keys.accessToken),
        expires: keys.expires,
        expiresIn: keys.expiresIn
      },
      unsubscriptions: [],
      scans: [],
      paidScans: []
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
        ...user.keys,
        refreshToken: decrypt(user.keys.refreshToken),
        accessToken: decrypt(user.keys.accessToken)
      },
      unsubscriptions: user.unsubscriptions.map(unsub => {
        return Object.keys(unsub).reduce((out, k) => {
          if (k === 'image') {
            return {
              ...out,
              image: !!unsub.image
            };
          }
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
        }, {});
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
  let updateObj = {
    ...userData,
    lastUpdatedAt: isoDate()
  };
  if (keys) {
    updateObj = {
      ...updateObj,
      keys: {
        ...keys,
        refreshToken: encrypt(keys.refreshToken),
        accessToken: encrypt(keys.accessToken)
      }
    };
  }
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $set: updateObj
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
  }, {});
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

export async function resolveUnsubscription(id, mailId) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id, 'unsubscriptions.id': mailId },
      { $set: { 'unsubscriptions.$.resolved': true } }
    );
    console.log(`users-dao: resolved users unsubscriptions ${id}`);
  } catch (err) {
    console.error('users-dao: error resolving user unsubscriptions');
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

export async function getUnsubscribeImage(id, mailId) {
  try {
    const col = await db().collection(COL_NAME);
    const user = await col.findOne({ id });
    const { unsubscriptions } = user;
    const unsub = unsubscriptions.find(u => u.id === mailId);
    console.log(`users-dao: fetching subscription image`);
    if (!unsub) {
      return null;
    }
    return decrypt(unsub.image);
  } catch (err) {
    console.error(`users-dao: failed to fetch subscription image`);
    console.error(err);
    throw err;
  }
}

export async function updatePaidScan(id, scanType) {
  try {
    const col = await db().collection(COL_NAME);
    const { paidScans = [] } = await getUser(id);
    const newPaidScans = paidScans.reduce(
      (out, p) => {
        if (!out.done && p.scanType === scanType && !p.performed) {
          return {
            done: true,
            scans: [...out.scans, { ...p, performed: true }]
          };
        }
        return { ...out, scans: [...out.scans, p] };
      },
      { done: false, scans: [] }
    );
    await col.updateOne({ id }, { $set: { paidScans: newPaidScans.scans } });
    console.log(`users-dao: updated users scans ${id}`);
  } catch (err) {
    console.error('users-dao: error updating user scans');
    console.error(err);
    throw err;
  }
}

export async function addPaidScan(id, scanType) {
  try {
    const col = await db().collection(COL_NAME);
    await col.updateOne(
      { id },
      {
        $push: {
          paidScans: { scanType, paidAt: isoDate(), performed: false }
        }
      }
    );
    console.log(`users-dao: added users paid scans ${id}`);
  } catch (err) {
    console.error('users-dao: error adding user paid scans');
    console.error(err);
    throw err;
  }
}

export async function updateIgnoreList(id, { action, value }) {
  try {
    const col = await db().collection(COL_NAME);
    let update = {
      $set: {
        lastUpdatedAt: isoDate()
      }
    };
    if (action === 'add') {
      update = {
        ...update,
        $push: {
          ignoredSenderList: value
        }
      };
    } else if (action === 'remove') {
      update = {
        ...update,
        $pull: {
          ignoredSenderList: { $in: [value] }
        }
      };
    } else {
      throw new Error('Operation not supported');
    }
    col.updateOne({ id }, update);
    const user = await getUser(id);
    return user;
  } catch (err) {
    console.error(
      `users-dao: error performing ${action} to user ${id} ignore list`
    );
    console.error(err);
    throw err;
  }
}

export async function addReferral(id, { userId, scanType, price }) {
  try {
    const col = await db().collection(COL_NAME);
    if (id === userId) {
      return console.warn('user tried to redeem own referral code');
    }
    return col.updateOne(
      { id },
      {
        $push: {
          referrals: {
            userId,
            scanType,
            price
          }
        }
      }
    );
  } catch (err) {
    console.error(`users-dao: failed to add referral to ${id}`);
    console.error(err);
    throw err;
  }
}

export async function updateReferral(id, { userId, scanType, price }) {
  try {
    const col = await db().collection(COL_NAME);
    if (id === userId) {
      return console.warn('user tried to redeem own referral code');
    }
    return col.updateOne(
      { id, 'referrals.userId': userId },
      {
        $set: {
          'referrals.$.scanType': scanType,
          'referrals.$.price': price
        }
      }
    );
  } catch (err) {
    console.error(`users-dao: failed to update referral to ${id}`);
    console.error(err);
    throw err;
  }
}

export async function getUserByReferralCode(referralCode) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ referralCode });
  } catch (err) {
    console.error(
      `users-dao: failed to get user by referral code ${referralCode}`
    );
    console.error(err);
    throw err;
  }
}
