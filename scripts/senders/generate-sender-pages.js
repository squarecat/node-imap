require('@babel/register');
require('@babel/polyfill');
const psl = require('./psl');

const db = require('../../server/dao/db');
const nameMappings = require('./name-mappings.json');
const labelMappings = require('./label-mappings.json');
const domainMappings = require('./domain-mappings.json');
const _capitalize = require('lodash.capitalize');

function getName(domain) {
  return nameMappings[domain] || domain;
}

function getLabel(name) {
  return labelMappings[name] || _capitalize(name);
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
    const name = getName(parsed.sld);
    const label = getLabel(name);
    const domain = domainMappings[name] || parsed.domain;

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
        label,
        score,
        sender,
        domain,
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
