const Hashes = require('jshashes');
const db = require('./db');

// straight up copy these props
// to the new object
const keepKeys = [
  'id',
  'profileImg',
  'referralCode',
  'referrals',
  'name',
  'email',
  'createdAt',
  'unsubscriptions',
  'token'
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
      credits: 100
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
      connectedFirstAccount: true
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
  const cur = await col.find({ __version: { $ne: '2.0' } });
  const count = await cur.countDocuments();
  console.log(`migrating ${count} users...`);
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
    } catch (err) {
      console.log(`failed on user ${user.id}`);
      console.error(err);
    } finally {
      currentCount = currentCount + 1;
    }
  });
})();
