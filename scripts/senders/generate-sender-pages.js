require('@babel/register');
require('@babel/polyfill');
const psl = require('./psl');

const db = require('../../server/dao/db');

async function run() {
  await db.connect();

  const conn = await db.connect();
  const col = await conn.collection('occurrences');
  const results = col.aggregate([
    {
      $project: {
        sender: '$sender',
        seenCount: { $size: '$seenBy' },
        unsubscribedCount: { $size: '$unsubscribedBy' },
        addresses: '$addresses',
        score: '$score'
      }
    },
    { $sort: { seenCount: -1 } },
    { $limit: 200 }
  ]);
  const oc = await results.toArray();
  const counts = oc.map(o => {
    const { sender, seenCount, unsubscribedCount, addresses, score } = o;
    const parsed = psl.parse(sender);
    const name = parsed.sld;
    return {
      name,
      score,
      sender,
      domain: parsed.domain,
      seen: seenCount,
      unsubscribes: unsubscribedCount,
      addresses,
      slug: `/how-to-unsubscribe-from-${name.toLowerCase()}-emails`
    };
  });
  console.log(JSON.stringify(counts, null, 2));
}

run();
