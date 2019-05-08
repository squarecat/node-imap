import db, { isoDate } from './db';

import _groupBy from 'lodash.groupby';
import { hash } from './encryption';
import logger from '../utils/logger';
import { parseEmail } from '../utils/parsers';

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
    await addNew({
      occurrences: newOccurrences,
      userId,
      frequencyLabel,
      now,
      col
    });
    await updateExisting({
      occurrences: existingOccurences,
      userId,
      frequencyLabel,
      now,
      col
    });
  } catch (err) {
    logger.error(`stats-dao: error bulk updating occurrences`);
    logger.error(err);
    throw err;
  }
}

export async function addUnsubscribeOccrurence(userId, from) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const { senderAddress } = parseSenderEmail(from);
    if (!senderAddress.includes('@')) {
      return null;
    }
    const hashedAddress = hash(senderAddress);
    const domain = parseDomain(senderAddress);
    const hashedUser = hash(`${userId}-${senderAddress}`);
    await col.updateOne(
      {
        hashedSender: hash(domain),
        unsubscribedBy: { $ne: hashedUser }
      },
      {
        $addToSet: {
          unsubscribedBy: hashedUser
        },
        $inc: {
          [`addressUnsubscribes.${hashedAddress}`]: 1
        },
        $set: {
          lastUnsubscribed: now
        }
      }
    );
  } catch (err) {
    logger.error(`stats-dao: error bulk updating occurrences`);
    logger.error(err);
    throw err;
  }
}

function parseDomain(senderAddress) {
  let domain = senderAddress.split('@')[1];
  if (domain.endsWith('>')) {
    domain = domain.substr(0, domain.length - 1);
  }
  return domain;
}

async function partitionOccurrences({ occurrences, col }) {
  const hashedSenders = occurrences.map(oc => hash(oc.domain));
  const existing = await col
    .find({
      hashedSender: {
        $in: hashedSenders
      }
    })
    .toArray();
  let existingOccurences = occurrences.filter(oc => {
    return existing.some(eo => eo.hashedSender === hash(oc.domain));
  });
  let newOccurrences = occurrences.filter(oc => {
    return existing.every(eo => eo.hashedSender !== hash(oc.domain));
  });
  const grouped = _groupBy(newOccurrences, 'domain');

  newOccurrences = newOccurrences.reduce((out, oc) => {
    const { senderAddress, domain } = oc;
    const dupes = grouped[domain];
    // is this a duplicate where all that's
    // different is the sender name? If so then
    // merge it with the one we've already seen
    if (dupes.indexOf(oc) > 0 && senderAddress === dupes[0].senderAddress) {
      return out.map(o => {
        if (o.domain === domain && o.senderAddress === senderAddress) {
          return {
            ...o,
            occurrences: o.occurrences + oc.occurrences
          };
        }
        return o;
      });
    }
    // if there is the second known address for this domain in this
    // groud then remove it from this array and add it to existing array
    // as it will be appended to the new one in the next operation
    if (dupes.findIndex(d => d.senderAddress === senderAddress) > 0) {
      existingOccurences = [...existingOccurences, oc];
      return out;
    }
    return [...out, oc];
  }, []);
  return { existingOccurences, newOccurrences };
}

async function addNew({ occurrences, userId, frequencyLabel, now, col }) {
  const documents = occurrences.map(oc => {
    const hashedUser = hash(`${userId}-${oc.senderAddress}`);
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
      seenBy: [hashedUser],
      addressOccurrences: {
        [hashedAddress]: 1
      },
      addressIsSpam: {
        [hashedAddress]: oc.isSpam ? 1 : 0
      },
      addressIsTrash: {
        [hashedAddress]: oc.isTrash ? 1 : 0
      },
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

async function updateExisting({
  occurrences,
  userId,
  frequencyLabel,
  now,
  col
}) {
  const operations = occurrences.map(oc => {
    const { isSpam, isTrash } = oc;
    // using sender not domain means that we increment
    // occurrences when address is different. eg news@facebook.com
    // and info@facebook.com will be two occurrences for the
    // facebook.com domain, but we store each address too
    const hashedUser = hash(`${userId}-${oc.senderAddress}`);
    const hashedAddress = hash(oc.senderAddress);
    return {
      updateOne: {
        filter: {
          hashedSender: hash(oc.domain),
          seenBy: { $ne: hashedUser }
        },
        update: {
          $push: {
            [`${frequencyLabel}.${hashedAddress}`]: oc.occurrences
          },
          $addToSet: {
            seenBy: hashedUser,
            addresses: oc.senderAddress,
            friendlyNames: oc.friendlyName,
            hashedAddresses: hashedAddress
          },
          $set: {
            sender: oc.domain,
            hashedSender: hash(oc.domain),
            lastSeen: now
          },
          $inc: {
            [`addressOccurrences.${hashedAddress}`]: 1,
            [`addressIsSpam.${hashedAddress}`]: isSpam ? 1 : 0,
            [`addressIsTrash.${hashedAddress}`]: isTrash ? 1 : 0
          }
        },
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

function parseSenderEmail(email) {
  const { fromEmail, fromName } = parseEmail(email);
  let senderAddress = fromEmail.trim();
  if (senderAddress.startsWith('<')) {
    senderAddress = senderAddress.substr(1, senderAddress.length);
  }
  if (senderAddress.endsWith('>')) {
    senderAddress = senderAddress.substr(0, senderAddress.length - 1);
  }
  return {
    senderAddress,
    friendlyName: fromName.trim()
  };
}
