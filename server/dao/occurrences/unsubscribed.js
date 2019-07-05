import db, { isoDate } from '../db';
import { parseDomain, parseSenderEmail } from './utils';

import { hash } from '../encryption';
import logger from '../../utils/logger';

const COL_NAME = 'occurrences';

export async function updateOccurrenceUnsubscribed(userId, from) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const { senderAddress, friendlyName } = parseSenderEmail(from);
    if (!senderAddress.includes('@')) {
      return null;
    }
    const hashedAddress = hash(senderAddress);
    const domain = parseDomain(senderAddress);
    const hashedUser = hash(`${userId}-${senderAddress}`);
    logger.info(
      `occurrences-dao: updating existing occurrence as <unsubscribed>`
    );
    await col.updateOne(
      {
        hashedSender: hash(domain),
        unsubscribedBy: { $ne: hashedUser }
      },
      {
        $set: {
          sender: domain,
          hashedSender: hash(domain),
          lastUnsubscribed: now
        },
        $addToSet: {
          unsubscribedBy: hashedUser,
          addresses: senderAddress,
          hashedAddresses: hashedAddress,
          friendlyNames: friendlyName
        },
        $inc: {
          [`addressUnsubscribes.${hashedAddress}`]: 1
        }
      },
      {
        upsert: false
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error updating occurrence as <unsubscribed>`);
    logger.error(err);
    throw err;
  }
}
