import db, { isoDate } from './db';

import { ObjectID } from 'mongodb';
import _groupBy from 'lodash.groupby';
import { hash } from './encryption';
import logger from '../utils/logger';
import { parseEmail } from '../utils/parsers';

const COL_NAME = 'occurrences';
let percentileRanks;
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
      `occurrences-dao: adding ${newOccurrences.length} new occurrences`
    );
    await addNew({
      occurrences: newOccurrences,
      userId,
      frequencyLabel,
      now,
      col
    });
    logger.info(
      `occurrences-dao: updating ${
        existingOccurences.length
      } existing occurrences`
    );
    await updateExisting({
      occurrences: existingOccurences,
      userId,
      frequencyLabel,
      now,
      col
    });
  } catch (err) {
    logger.error(`occurrences-dao: error bulk updating occurrences`);
    logger.error(err);
    throw err;
  }
}

// bulk update a bunch of occurrences that have been seen
// by a user
export async function updateOccurrencesSeen(userId, senders) {
  const now = isoDate();
  try {
    const col = await db().collection(COL_NAME);
    const operations = senders.map(senderEmail => {
      const { senderAddress, friendlyName } = parseSenderEmail(senderEmail);
      let domain = senderAddress.split('@')[1];
      if (domain.endsWith('>')) {
        domain = domain.substr(0, domain.length - 1);
      }
      const hashedUser = hash(`${userId}-${senderAddress}`);
      const hashedAddress = hash(senderAddress);
      const hashedDomain = hash(domain);
      return {
        updateOne: {
          filter: {
            hashedSender: hashedDomain,
            seenBy: { $ne: hashedUser }
          },
          update: {
            $set: {
              lastSeen: now,
              sender: domain,
              hashedSender: hashedDomain
            },
            $addToSet: {
              seenBy: hashedUser,
              addresses: [senderAddress],
              hashedAddresses: [hashedAddress],
              friendlyNames: [friendlyName]
            },
            $inc: {
              [`addressOccurrences.${hashedAddress}`]: 1
            }
          },
          upsert: true
        }
      };
    });

    if (!operations.length) {
      return null;
    }
    logger.info(
      `occurrences-dao: marking ${operations.length} occurrences as seen`
    );
    return col.bulkWrite(operations, {
      ordered: false
    });
  } catch (err) {
    logger.error(`occurrences-dao: error bulk updating occurrences`);
    logger.error(err);
    throw err;
  }
}

export async function addUnsubscribeOccurrence(userId, from) {
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
          addresses: [senderAddress],
          hashedAddresses: [hashedAddress],
          friendlyNames: [friendlyName]
        },
        $inc: {
          [`addressUnsubscribes.${hashedAddress}`]: 1
        }
      },
      {
        upsert: true
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
      }
    };

    if (frequencyLabel) {
      update = {
        ...update,
        $push: {
          [`${frequencyLabel}.${hashedAddress}`]: oc.occurrences
        }
      };
    }
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

export async function getScores(senderAddresses) {
  const col = await db().collection(COL_NAME);
  const senderData = await col
    .find(
      {
        addresses: {
          $in: senderAddresses
        }
      },
      {
        projection: {
          addressOccurrences: 1,
          addressUnsubscribes: 1,
          addresses: 1,
          addressScores: 1,
          score: 1
        }
      }
    )
    .toArray();
  return senderAddresses.reduce((out, address) => {
    const sender = senderData.find(sd => sd.addresses.includes(address));
    const hashedAddress = hash(address, 'colinlovesencryption');
    if (sender && sender.addressScores && sender.addressScores[hashedAddress]) {
      const addressScore = sender.addressScores[hashedAddress];
      const occurrences = sender.addressOccurrences[hashedAddress];
      const unsubscribes = sender.addressUnsubscribes[hashedAddress] || 0;
      const unsubscribePercentage =
        unsubscribes > 0 ? unsubscribes / occurrences : 0;
      return [
        ...out,
        {
          address,
          senderScore: sender.score || null,
          score: addressScore,
          unsubscribePercentage,
          rank:
            addressScore === null
              ? null
              : percentileRanks.reduce((r, { rank, score }) => {
                  if (addressScore > score) {
                    return rank;
                  }
                  return r;
                }, percentileRanks[0].rank)
        }
      ];
    }
    return out;
  }, []);
}

// total = 50
const weights = {
  percentageIsSpam: n => {
    // max 0.2
    return n / 5;
  },
  percentageIsTrash: n => {
    // max 0.05
    return n / 20;
  },
  // numberOfAddresses: n => {
  //   if (n > 7) {
  //     return 0.08;
  //   }
  //   return n;
  // },
  occurrencesPerWeek: n => {
    // max 0.25
    if (n > 10) {
      return 0.25;
    }
    return n / 40;
  },
  percentageUnsubscribed: n => {
    // max 0.5
    return n / 2;
  }
};

// seen: 18
// unsub: 4
// avg 6 month 17.75
// avg 3 days 5
// addresses 1

export async function refreshScores() {
  console.log('refreshing scores');
  const col = await db().collection(COL_NAME);
  const cur = col.find({});
  let allScores = [];
  while (await cur.hasNext()) {
    const {
      _id,
      addressUnsubscribes,
      addressOccurrences,
      addressIsSpam,
      addressIsTrash,
      threeDayFrequencies,
      oneMonthFrequencies,
      sixMonthFrequencies,
      hashedAddresses
    } = await cur.next();
    let allAddressScores = [];
    const addressScores = hashedAddresses.reduce((scores, address) => {
      let score = 1;
      const timesSeen = addressOccurrences[address] || 0;
      // dont include this if we dont have much data
      if (timesSeen < 2) {
        return scores;
      }
      if (addressIsSpam && addressIsSpam[address]) {
        const count = addressIsSpam[address];
        score -= weights.percentageIsSpam(count / timesSeen);
      }
      if (addressIsTrash && addressIsTrash[address]) {
        const count = addressIsSpam[address];
        score -= weights.percentageIsTrash(count / timesSeen);
      }

      let avgs = [];
      if (threeDayFrequencies) {
        avgs = [...avgs, avg(threeDayFrequencies[address]) * 2];
      }
      if (oneMonthFrequencies) {
        avgs = [...avgs, avg(oneMonthFrequencies[address]) / 4.4];
      }
      if (sixMonthFrequencies) {
        avgs = [...avgs, avg(sixMonthFrequencies[address]) / 26.4];
      }

      const avgOneWeek = avg(avgs);
      score -= weights.occurrencesPerWeek(avgOneWeek);

      const timesUnsubscribed = addressUnsubscribes[address] || 0;
      score -= weights.percentageUnsubscribed(timesUnsubscribed / timesSeen);

      allAddressScores = [...allAddressScores, score];
      return {
        ...scores,
        [address]: score
      };
    }, {});
    if (Object.keys(addressScores).length) {
      const senderScore = avg(allAddressScores);
      allScores = [...allScores, senderScore];
      col.updateOne(
        { _id: new ObjectID(_id) },
        {
          $set: {
            addressScores,
            score: senderScore
          }
        }
      );
    }
  }
  console.log('calculating ranks...');
  percentileRanks = calculatePercentileRanks(allScores);
  console.log(percentileRanks);
}
function calculatePercentileRanks(scores) {
  const sorted = scores.sort(function(a, b) {
    a = Number.isNaN(a) ? Number.NEGATIVE_INFINITY : a;
    b = Number.isNaN(b) ? Number.NEGATIVE_INFINITY : b;

    if (a > b) return 1;
    if (a < b) return -1;

    return 0;
  });
  const ranks = {
    0: 'F',
    20: 'E',
    30: 'D',
    40: 'C',
    50: 'B',
    70: 'A',
    90: 'A+'
  };
  return Object.keys(ranks).map(p => {
    if (p === '0') return { rank: 'F', score: 0 };
    const kIndex = Math.ceil(sorted.length * (+p / 100)) - 1;
    return {
      rank: ranks[p],
      score: sorted[kIndex]
    };
  });
}

function avg(arr = []) {
  if (!arr.length) return 0;
  return arr.reduce((out, n) => out + n, 0) / arr.length;
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
