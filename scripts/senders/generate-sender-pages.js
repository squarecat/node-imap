require('@babel/register');
require('@babel/polyfill');
const psl = require('./psl');

const db = require('../../server/dao/db');

const nameChanges = [
  {
    name: 'facebookmail',
    newName: 'facebook'
  },
  {
    name: 'intercom-mail',
    newName: 'intercom'
  },
  {
    name: 'expediamail',
    newName: 'expedia'
  },
  {
    name: 'buffermail',
    newName: 'buffer'
  },
  {
    name: 'discoursemail',
    newName: 'discourse'
  },
  {
    name: 'makenotion',
    newName: 'notion'
  }
];

function getName(name) {
  const changed = nameChanges.find(n => n.name === name);
  if (changed) {
    return changed.newName;
  }
  return name;
}

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
    let name = getName(parsed.sld);

    if (name === 'leavemealone') {
      return out;
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
