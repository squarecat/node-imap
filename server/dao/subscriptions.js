import db from './db';
import { encrypt } from './encryption';
import logger from '../utils/logger';

const COL_NAME = 'unsubscriptions';

export async function addUnresolvedUnsubscription(data) {
  const { mailId, reason, unsubStrategy, domain } = data;
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      mailId,
      domain: encrypt(domain),
      reason,
      unsubStrategy,
      resolved: false
    });
  } catch (err) {
    logger.error('subscriptions-dao: error inserting unresolved unsubsription');
    logger.error(err);
    throw err;
  }
}

export async function addResolvedUnsubscription(data) {
  const { mailId, domain } = data;
  try {
    const col = await db().collection(COL_NAME);
    await col.insertOne({
      mailId,
      domain: encrypt(domain),
      resolved: true
    });
  } catch (err) {
    logger.error('subscriptions-dao: error inserting resolved unsubsription');
    logger.error(err);
    throw err;
  }
}
