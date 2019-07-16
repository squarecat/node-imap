require('@babel/register');
require('@babel/polyfill');
const url = require('url');

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
    //const parts = sender.split('.');
    const name = getName(sender); //parts[parts.length - 2];

    return {
      name,
      score,
      sender,
      seen: seenCount,
      unsubscribes: unsubscribedCount,
      addresses
    };
  });
  console.log(JSON.stringify(counts, null, 2));
}

run();

function getName(url) {
  var regex_var = new RegExp(
    /(\.[^.]{0,2})(\.[^.]{0,2})(\.*$)|(\.[^.]*)(\.*$)/
  );

  return url
    .replace(regex_var, '')
    .replace(/.org$/, '')
    .split('.')
    .pop();
}
