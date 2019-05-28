import db, { isoDate } from './db';

import logger from '../utils/logger';
import { v4 } from 'node-uuid';

const COL_NAME = 'organisations';

// const organisation = {
//   name: 'Squarecat', // name of company
//   adminUserId: '123456789', // id of user
//   allowAnyUserWithCompanyEmail: true,
//   currentUsers: [
//     // array of users in the organisation
//     '123456789', // including admin
//     '11111',
//     '22222'
//   ],
//   active: false, // if the org is active. if false users cannot unsub
//   // same as users billing added at onboarding
//   billing: {
//     card: {
//       last4: '4242',
//       exp_month: 3,
//       exp_year: 2020
//     }
//   },
//   // added at onboarding
//   company: {
//     vatNumber: 'xxx',
//     name: 'Squarecat OU',
//     address: 'Sepapaja 6, Estonia'
//   },
//   customerId: 'xxx', // stripe customer id
//   paymentMethodId: 'xxx', // stripe payment method id
//   subscriptiondId: 'xxx' // stripe subscription id
// };

export async function create(data) {
  try {
    const col = await db().collection(COL_NAME);

    const id = v4();
    const {
      name,
      adminUserId,
      adminUserEmail,
      domain,
      allowAnyUserWithCompanyEmail = false
    } = data;

    await col.insertOne({
      id,
      createdAt: isoDate(),
      lastUpdatedAt: isoDate(),
      name,
      adminUserId,
      adminUserEmail,
      domain,
      allowAnyUserWithCompanyEmail,
      currentUsers: [adminUserId],
      active: false
    });
    return get(id);
  } catch (err) {
    logger.error('organisation-dao: error inserting organisation');
    logger.error(err);
    throw err;
  }
}

export async function get(id) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ id });
  } catch (err) {
    logger.error(`organisation-dao: error getting organisation ${id}`);
    logger.error(err);
    throw err;
  }
}
