import { createCacheClient } from '../utils/redis';
import { hashEmail } from '../dao/encryption';
import { promisify } from 'util';

const client = createCacheClient({
  prefix: 'lma.scores_'
});

const ranksClient = createCacheClient({
  prefix: 'lma.ranks_'
});

const getAll = promisify(client.mget).bind(client);
const getRanksToday = promisify(ranksClient.get).bind(ranksClient, 'today');

let percentileRanks = {};

export async function getRanks() {
  const r = await getRanksToday();
  percentileRanks = JSON.parse(r);
  console.log('[scores]: refreshed ranks');
  return r;
}

// refresh ranks hourly in case it has changed
setInterval(getRanks, 1000 * 60 * 60);
getRanks();

export async function fetchScores({
  senderAddresses = [],
  hashedSenderAddresses = []
}) {
  let addresses;
  let hashed;
  try {
    if (senderAddresses.length) {
      // dedupe addresses and convert to their hashes
      hashed = senderAddresses.reduce(
        (out, a) => ({
          ...out,
          [a.toLowerCase()]: hashEmail(a.toLowerCase())
        }),
        {}
      );
      addresses = Object.values(hashed);
    } else {
      // dedupe already hashed addresses
      addresses = [
        Object.keys(
          hashedSenderAddresses.reduce(
            (out, a) => ({
              ...out,
              [a]: 1
            }),
            {}
          )
        )
      ];
    }
    const scores = (await getAll(addresses.join())).reduce((out, data) => {
      const s = JSON.parse(data);
      if (!s) return out;
      return {
        ...out,
        [s.key]: {
          rank: percentileRanks.reduce((r, { rank, score }) => {
            if (s.score > score) {
              return rank;
            }
            return r;
          }, percentileRanks[0].rank),
          score: s.score,
          perWeek: s.perWeek,
          unsubscribeRate: s.unsubscribeRate
        }
      };
    }, {});

    if (senderAddresses.length) {
      return senderAddresses.reduce((out, address) => {
        const score = scores[hashed[address]];
        return score
          ? {
              ...out,
              [address]: score
            }
          : out;
      }, {});
    }
    return hashedSenderAddresses.reduce((out, hash) => {
      const score = scores[hash];
      return score
        ? {
            ...out,
            [hash]: score
          }
        : out;
    }, {});
  } catch (err) {
    console.error(err);
    return {};
  }
}
