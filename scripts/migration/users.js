const Hashes = require('jshashes');
const db = require('./db');
const crypto = require('crypto');

const key = process.env.DB_ENCRYPT_PW;

// straight up copy these props
// to the new object
const keepKeys = [
  'id',
  'profileImg',
  'referralCode',
  'name',
  'email',
  'createdAt',
  'unsubscriptions',
  'token',
  'ignoredSenderList'
];

const migrateUser = oldRecord => {
  const now = Date.now();
  // copy props that are the same
  let newRecord = keepKeys.reduce((r, k) => {
    return {
      ...r,
      [k]: oldRecord[k]
    };
  }, {});
  // convert provider to loginProvider
  newRecord = {
    ...newRecord,
    loginProvider: oldRecord.provider
  };
  newRecord = {
    ignoredSenderList: newRecord.ignoredSenderList
      ? newRecord.ignoredSenderList
      : []
  };
  // create hashed emails array
  newRecord = {
    ...newRecord,
    hashedEmails: [hashEmail(oldRecord.email)]
  };
  // add new preferences
  newRecord = {
    ...newRecord,
    preferences: {
      ...oldRecord.preferences,
      occurrencesConsent: true
    }
  };
  // move the keys object to be an account
  // and add a relevant activity
  const referralCredits = oldRecord.referrals * 15;
  newRecord = {
    ...newRecord,
    accounts: [
      {
        id: oldRecord.id,
        provider: oldRecord.provider,
        email: oldRecord.email,
        keys: oldRecord.keys,
        addedAt: now
      }
    ],
    activity: [
      {
        type: 'connectedFirstAccount',
        data: {
          id: oldRecord.id,
          provider: oldRecord.provider,
          email: oldRecord.email
        },
        rewardCredits: 100,
        notificationSeen: true,
        id: '0',
        timestamp: now
      }
    ],
    billing: {
      credits: 10 + referralCredits
    }
  };
  // migrate referrals
  newRecord = {
    ...newRecord,
    referrals: oldRecord.referrals.map(r => ({
      userId: r.userId,
      reward: 5
    }))
  };

  newRecord = {
    ...newRecord,
    lastUpdatedAt: now,
    milestones: {
      connectedFirstAccount: 1
    },
    __migratedFrom: '1.0',
    __version: '2.0'
  };

  return newRecord;
};

function hashEmail(email) {
  return new Hashes.SHA1().hex(email);
}

(async () => {
  const conn = await db.connect();
  const col = await conn.collection('users');
  const occCol = await conn.collection('occurrences');
  const cur = await col.find({ id: '116477163028920794979' });
  // const cur = await col.find({ __version: { $ne: '2.0' } });
  const count = await cur.count();
  console.log(`migrating ~${count} users...`);
  let currentCount = 1;
  cur.forEach(async user => {
    // double check this hasn't been updated yet
    // due to mongo replacing objects in the cursor
    // as we iterate
    if (user.__version === '2.0') {
      return;
    }
    console.log(`${currentCount}/${count}`);
    const newUser = migrateUser(user);
    try {
      await col.replaceOne({ id: user.id }, newUser);
      // put their ignored senders into occurrences hearts if
      // they have some
      if (newUser.ignoredSenderList && newUser.ignoredSenderList.length) {
        newUser.ignoredSenderList.forEach(sender => {
          const { senderAddress } = parseSenderEmail(sender);
          if (!senderAddress.includes('@')) {
            return null;
          }
          const hashedAddress = hash(senderAddress);
          const domain = parseDomain(senderAddress);
          occCol.updateOne(
            {
              hashedSender: hash(domain)
            },
            {
              $inc: {
                [`addressHearts.${hashedAddress}`]: 1
              }
            },
            {
              upsert: false
            }
          );
        });
      }
    } catch (err) {
      console.log(`failed on user ${user.id}`);
      console.error(err);
    } finally {
      currentCount = currentCount + 1;
    }
  });
})();

function parseEmail(str = '') {
  if (!str) {
    return {
      fromName: 'Unknown',
      fromEmail: '<unknown>'
    };
  }
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else if (str.match(/<?.*@/)) {
    const [, name] = /<?(.*)@/.exec(str);
    fromName = name || str;
    fromEmail = str;
  } else {
    fromName = str;
    fromEmail = str;
  }
  return { fromName, fromEmail };
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

function hash(value, k = key) {
  try {
    if (!value) return value;
    return crypto
      .createHmac('sha256', k)
      .update(value)
      .digest('hex');
  } catch (err) {
    return value;
  }
}

function parseDomain(senderAddress) {
  let domain = senderAddress.split('@')[1];
  if (domain.endsWith('>')) {
    domain = domain.substr(0, domain.length - 1);
  }
  return domain;
}
