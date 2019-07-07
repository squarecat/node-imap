import { ObjectID } from 'mongodb';
import db from '../db';
import { hash } from '../encryption';

const COL_NAME = 'occurrences';
let percentileRanks;

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

// total = 1
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
      addressHearts,
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

      // const timesHearted = addressHearts[address];
      // the more hearts they have, the less the
      // other things should count
      // const heartPercentage = timesHearted / timesSeen;

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
