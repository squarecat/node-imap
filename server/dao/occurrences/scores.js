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
