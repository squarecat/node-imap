import { v4 } from 'node-uuid';
import {
  getUser,
  createUser,
  updateUser,
  addUnsubscription,
  addScan
} from '../dao/user';

export async function getUserById(id) {
  try {
    let user = await getUser(id);
    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function createOrUpdateUserFromGoogle(userData, keys) {
  try {
    const { id, emails } = userData;
    const { value: email } = emails.find(e => e.type === 'account');
    let user = await getUser(id);
    if (!user) {
      user = await createUser({
        id,
        email,
        keys,
        token: v4()
      });
    } else {
      user = await updateUser(id, {
        keys
      });
    }
    return user;
  } catch (err) {
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
    console.error(err);
    throw err;
  }
}

export async function addUnsubscriptionToUser(userId, { mail, ...rest }) {
  const { to, from, id, googleDate } = mail;
  try {
    await addUnsubscription(userId, { to, from, id, googleDate, ...rest });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export function addScanToUser(userId, scanData) {
  return addScan(userId, scanData);
}
