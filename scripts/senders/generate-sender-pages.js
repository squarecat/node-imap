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
    { $limit: 100 }
  ]);
  const oc = await results.toArray();
  // remove duplicates
  let output = oc.reduce((out, o) => {
    const { sender, seenCount, unsubscribedCount, addresses, score } = o;
    const parsed = psl.parse(sender);
    let name = parsed.sld;
    if (name === 'facebookmail') {
      name = 'facebook';
    }
    if (out[name]) {
      return {
        ...out,
        [out[name]]: {
          ...out[name],
          seen: seenCount + out[name].seen,
          unsubscribes: unsubscribedCount + out[name].unsubscribes
        }
      };
    }
    return {
      ...out,
      [name]: {
        name,
        score,
        sender,
        domain: parsed.domain,
        seen: seenCount,
        unsubscribes: unsubscribedCount,
        addresses,
        slug: `/how-to-unsubscribe-from-${name.toLowerCase()}-emails`
      }
    };
  }, {});
  output = Object.keys(output).map(k => output[k]);
  console.log(JSON.stringify(output, null, 2));
}

run();
