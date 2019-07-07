import db, { isoDate } from '../db';
import { parseDomain, parseSenderEmail } from './utils';

import { hash } from '../encryption';
import logger from '../../utils/logger';

const COL_NAME = 'occurrences';

export async function updateHeart(sender, isHearted) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const { senderAddress } = parseSenderEmail(sender);
    if (!senderAddress.includes('@')) {
      return null;
    }
    const hashedAddress = hash(senderAddress);
    const domain = parseDomain(senderAddress);
    logger.info(`occurrences-dao: updating existing occurrence as <hearted>`);
    await col.updateOne(
      {
        hashedSender: hash(domain)
      },
      {
        $set: {
          lastHearted: now
        },
        $inc: {
          [`addressHearts.${hashedAddress}`]: isHearted ? 1 : -1
        }
      },
      {
        upsert: false
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error updating occurrence as <hearted>`);
    logger.error(err);
    throw err;
  }
}
