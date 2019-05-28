import { removeUserAccount, removeUserBillingCard, updateUser } from './user';

import { create } from './dao/organisation';
import { getUserByEmail } from '../dao/user';
import logger from '../utils/logger';

export async function createOrganisation(
  email,
  { name, domain, allowAnyUserWithCompanyEmail }
) {
  try {
    logger.info(`organisation-service: creating an organisation`);
    const user = await getUserByEmail(email);
    if (!user) {
      logger.error(
        `organisation-service: cannot create organisation, admin user does not exist`
      );
      throw new Error('cannot create organisation, admin user does not exist');
    }

    const { id: userId, email, accounts, billing } = user;

    const organisation = await create({
      adminUserId: userId,
      adminUserEmail: email,
      name,
      domain,
      allowAnyUserWithCompanyEmail
    });

    // set the user as part of the organsiation and
    // - remove accounts as organisation users can only use their company accounts
    // - remove customer's own billing as they won't need to add payment methods
    await updateUser(userId, {
      organsiationId: organisation.id
    });
    accounts.forEach(async account => {
      logger.debug(`organisation-service: removing user account ${account.id}`);
      await removeUserAccount(user, account.email);
    });
    if (billing) {
      await removeUserBillingCard(userId);
    }
    return organisation;
  } catch (err) {
    throw err;
  }
}
