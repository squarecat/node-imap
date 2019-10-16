import db, { isoDate } from '../db';
import { parseSenderEmail, partitionOccurrences } from './utils';

import { hash } from '../encryption';
import logger from '../../utils/logger';

const COL_NAME = 'occurrences';
const timeframeToFrequency = {
  '3d': 'threeDayFrequencies',
  '1w': 'oneWeekFrequencies',
  '1m': 'oneMonthFrequencies',
  '6m': 'sixMonthFrequencies'
};

export async function updateOccurrences(userId, occurrences, timeframe) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const frequencyLabel = timeframeToFrequency[timeframe];
    const parsedOccurrences = occurrences.reduce((out, oc) => {
      const { senderAddress, friendlyName } = parseSenderEmail(oc.sender);
      if (!senderAddress.includes('@')) {
        return out;
      }
      let domain = senderAddress.split('@')[1];
      if (domain.endsWith('>')) {
        domain = domain.substr(0, domain.length - 1);
      }
      return [...out, { ...oc, domain, friendlyName, senderAddress }];
    }, []);
    const { existingOccurences, newOccurrences } = await partitionOccurrences({
      occurrences: parsedOccurrences,
      col
    });
    logger.info(
      `occurrences-dao: adding ${newOccurrences.length} new occurrences <frequency>`
    );
    await addNew({
      occurrences: newOccurrences,
      userId,
      frequencyLabel,
      now,
      col
    });
    logger.info(
      `occurrences-dao: updating ${existingOccurences.length} existing occurrences <frequency>`
    );
    await updateExisting({
      occurrences: existingOccurences,
      userId,
      frequencyLabel,
      now,
      col
    });
  } catch (err) {
    logger.error(
      `occurrences-dao: error bulk updating occurrences <frequency>`
    );
    logger.error(err);
    throw err;
  }
}

async function addNew({ occurrences, frequencyLabel, col }) {
  const documents = occurrences.map(oc => {
    const hashedAddress = hash(oc.senderAddress);
    return {
      sender: oc.domain,
      hashedSender: hash(oc.domain),
      addresses: [oc.senderAddress],
      hashedAddresses: [hashedAddress],
      friendlyNames: [oc.friendlyName],
      [frequencyLabel]: {
        [hashedAddress]: [oc.occurrences]
      },
      addressUnsubscribes: {
        [hashedAddress]: 0
      },
      addressOccurrences: {
        [hashedAddress]: 0
      },
      addressIsSpam: {
        [hashedAddress]: oc.isSpam ? 1 : 0
      },
      addressIsTrash: {
        [hashedAddress]: oc.isTrash ? 1 : 0
      },
      seenBy: [],
      unsubscribedBy: [],
      lastSeen: null,
      lastUnsubscribed: null
    };
  });
  if (!documents.length) {
    return null;
  }
  return col.insertMany(documents);
}

async function updateExisting({ occurrences, userId, frequencyLabel, col }) {
  const operations = occurrences.map(oc => {
    const { isSpam, isTrash } = oc;
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
        hashedAddresses: hashedAddress
      },
      $set: {
        sender: oc.domain,
        hashedSender: hash(oc.domain)
      },
      $inc: {
        [`addressIsSpam.${hashedAddress}`]: isSpam ? 1 : 0,
        [`addressIsTrash.${hashedAddress}`]: isTrash ? 1 : 0
      },
      $push: {
        [`${frequencyLabel}.${hashedAddress}`]: oc.occurrences
      }
    };
    return {
      updateOne: {
        filter: {
          hashedSender: hash(oc.domain),
          // if the user has already unsubbed then this
          // not a useful stat
          unsubscribedBy: { $ne: hashedUser }
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
