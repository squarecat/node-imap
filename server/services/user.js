import { getUser, createUser } from '../dao/user';

export async function createUserFromGoogle(userData, keys) {
  try {
    const { id, emails } = userData;
    const { value: email } = emails.find(e => e.type === 'account');
    let user = await getUser(id);
    if (!user) {
      user = await createUser({ id, email, keys });
    }
    return user;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
