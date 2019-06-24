const Hashes = require('jshashes');
const db = require('./db');

// straight up copy these props
// to the new object
const keepKeys = [
  'id',
  'profileImg',
  'referralCode',
  'referrals',
  'preferences',
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
  // move the keys object to be an account
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
    ]
  };
  newRecord = {
    ...newRecord,
    lastUpdatedAt: now,
    migratedFrom: '1.0',
    version: '2.0',
    milestones: {},
    activity: []
  };

  return newRecord;
};

function hashEmail(email) {
  return new Hashes.SHA1().hex(email);
}

(async () => {
  const conn = await db.connect();
  const col = await conn.collection('users');
  const cur = await col.find({ _version: { $ne: '2.0' } });
  cur.forEach(async user => {
    // double check this hasn't been updated yet
    // due to mongo replacing objects in the cursor
    // as we iterate
    if (user.version === '2.0') {
      return;
    }
    const newUser = migrateUser(user);
    await col.replaceOne({ id: user.id }, newUser);
  });
})();
