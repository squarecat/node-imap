import { v4 } from 'node-uuid';
import { getUser, createUser, updateUser } from '../dao/user';

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
