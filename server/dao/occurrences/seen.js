import db, { isoDate } from '../db';
import { parseSenderEmail, partitionOccurrences } from './utils';

import { hash } from '../encryption';
import logger from '../../utils/logger';

const COL_NAME = 'occurrences';

// bulk update a bunch of occurrences that have been seen
// by a user
export async function updateOccurrencesSeen(userId, senders) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const parsedOccurrences = senders.reduce((out, senderEmail) => {
      const { senderAddress, friendlyName } = parseSenderEmail(senderEmail);
      let domain = senderAddress.split('@')[1];
      if (!domain) {
        return out;
      }
      if (domain.endsWith('>')) {
        domain = domain.substr(0, domain.length - 1);
      }
      return [...out, { domain, friendlyName, senderAddress }];
    }, []);

    const { existingOccurences, newOccurrences } = await partitionOccurrences({
      occurrences: parsedOccurrences,
      col
    });
    logger.info(
      `occurrences-dao: adding ${newOccurrences.length} new occurrences <seen>`
    );
    await addNew({
      occurrences: newOccurrences,
      userId,
      now,
      col
    });
    logger.info(
      `occurrences-dao: updating ${
        existingOccurences.length
      } existing occurrences as <seen>`
    );
    await updateExisting({
      occurrences: existingOccurences,
      userId,
      now,
      col
    });
  } catch (err) {
    logger.error(`occurrences-dao: error updating occurrences as <seen>`);
    logger.error(err);
    throw err;
  }
}

async function addNew({ occurrences, col, now, userId }) {
  const documents = occurrences.map(oc => {
    const hashedAddress = hash(oc.senderAddress);
    const hashedUser = hash(`${userId}-${oc.senderAddress}`);
    return {
      sender: oc.domain,
      hashedSender: hash(oc.domain),
      addresses: [oc.senderAddress],
      hashedAddresses: [hashedAddress],
      friendlyNames: [oc.friendlyName],
      addressUnsubscribes: {
        [hashedAddress]: 0
      },
      addressOccurrences: {
        [hashedAddress]: 1
      },
      seenBy: [hashedUser],
      unsubscribedBy: [],
      lastSeen: now,
      lastUnsubscribed: null
    };
  });
  if (!documents.length) {
    return null;
  }
  return col.insertMany(documents);
}

async function updateExisting({ occurrences, userId, col }) {
  const operations = occurrences.map(oc => {
    // using sender not domain means that we increment
    // occurrences when address is different. eg news@facebook.com
    // and info@facebook.com will be two occurrences for the
    // facebook.com domain, but we store each address too
    const hashedUser = hash(`${userId}-${oc.senderAddress}`);
    const hashedAddress = hash(oc.senderAddress);
    let update = {
      $addToSet: {
        addresses: oc.senderAddress,
        friendlyNames: oc.friendlyName,
        hashedAddresses: hashedAddress,
        seenBy: hashedUser
      },
      $inc: {
        [`addressOccurrences.${hashedAddress}`]: 1
      }
    };

    return {
      updateOne: {
        filter: {
          hashedSender: hash(oc.domain),
          seenBy: { $ne: hashedUser }
        },
        update: update,
        upsert: false
      }
    };
  });
  if (!operations.length) {
    return null;
  }
  return col.bulkWrite(operations, {
    ordered: false
  });
}
