import { v4 } from 'node-uuid';
import {
  getUser,
  createUser,
  updateUser,
  addUnsubscription,
  addScan,
  resolveUnsubscription,
  addPaidScan,
  updatePaidScan,
  updateIgnoreList
} from '../dao/user';

import { updateCoupon } from './payments';

import { addUserToStats } from './stats';

export async function getUserById(id) {
  try {
    let user = await getUser(id);
    return user;
  } catch (err) {
    console.error('user-service: error getting user by id', id);
    console.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromGoogle(userData = {}, keys) {
  try {
    const { id, emails, photos = [] } = userData;
    const profileImg = photos.length ? photos[0].value : null;
    const { value: email } = emails.find(e => e.type === 'account');
    let user = await getUser(id);
    if (!user) {
      user = await createUser({
        id,
        email,
        profileImg,
        keys,
        token: v4()
      });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys,
        profileImg
      });
    }
    return user;
  } catch (err) {
    console.error(
      'user-service: error creating user from Google',
      userData.id || 'no userData id'
    );
    console.error(err);
    throw err;
  }
}

export async function updateUserToken(id, keys) {
  try {
    const user = await updateUser(id, {
      keys
    });
    return user;
  } catch (err) {
    console.error(
      'user-service: error updating user refreshtoken',
      id || 'no userData id'
    );
    console.error(err);
    throw err;
  }
}

export async function checkAuthToken(userId, token) {
  try {
    let user = await getUser(userId);
    if (!user || user.token !== token) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('user-service: error checking auth token for user', userId);
    console.error(err);
    throw err;
  }
}

export async function addUnsubscriptionToUser(userId, { mail, ...rest }) {
  const { to, from, id, googleDate } = mail;
  try {
    await addUnsubscription(userId, { to, from, id, googleDate, ...rest });
  } catch (err) {
    console.error('user-service: error adding unsubscription to user', userId);
    console.error(err);
    throw err;
  }
}

export function addScanToUser(userId, scanData) {
  return addScan(userId, scanData);
}

export async function resolveUserUnsubscription(userId, mailId) {
  return resolveUnsubscription(userId, mailId);
}

export async function updateCustomerId(userId, customerId) {
  return updateUser(userId, { customerId });
}

export function addPaidScanToUser(userId, scanType) {
  return addPaidScan(userId, scanType);
}

export function updatePaidScanForUser(userId, scanType) {
  return updatePaidScan(userId, scanType);
}

export async function addFreeScan(userId, scanType, coupon) {
  try {
    await addPaidScanToUser(userId, scanType);
    if (coupon) updateCoupon(coupon);
    return true;
  } catch (err) {
    throw err;
  }
}

export async function addToUserIgnoreList(id, email) {
  try {
    return updateIgnoreList(id, { action: 'add', value: email });
  } catch (err) {
    throw err;
  }
}
export async function removeFromUserIgnoreList(id, email) {
  try {
    return updateIgnoreList(id, { action: 'remove', value: email });
  } catch (err) {
    throw err;
  }
}
