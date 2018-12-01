import { v4 } from 'node-uuid';
import {
  getUser,
  createUser,
  updateUser,
  addUnsubscription,
  addScan,
  resolveUnsubscription
} from '../dao/user';

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
    const { id, emails } = userData;
    const { value: email } = emails.find(e => e.type === 'account');
    let user = await getUser(id);
    if (!user) {
      user = await createUser({
        id,
        beta: true,
        email,
        keys,
        token: v4()
      });
      addUserToStats();
    } else {
      user = await updateUser(id, {
        keys
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
