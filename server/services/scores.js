import { createCacheClient } from '../utils/redis';
import { hashEmail } from '../dao/encryption';
import { promisify } from 'util';

const client = createCacheClient({
  prefix: 'lma.scores_'
});

const getAll = promisify(client.mget).bind(client);

export async function fetchScores({
  senderAddresses = [],
  hashedSenderAddresses = []
}) {
  let addresses;
  let hashed;
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
  const scores = await getAll(addresses);

  if (senderAddresses.length) {
    return senderAddresses.map(address => ({
      address,
      score: scores[hashed[address]] || {}
    }));
  }
  return hashedSenderAddresses.map(hash => ({
    address: hash,
    score: scores[hash] || {}
  }));
}
