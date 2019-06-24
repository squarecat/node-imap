const Hashes = require('jshashes');
const db = require('./db');

const encrpytPass = process.env.ENCRYPT_KEY;
// occurrences weren't hashed properly, so we need to
// decrypt the email fields and hash them instead

// const migrateOcc = occ => {
//   const addresses = occ.addresses;
//   return {
//     ...occ,
//     hashedAddresses: addresses.map(add => hashEmail(add))
//   };
// };

// (async () => {
//   const conn = await db.connect();
//   const col = await conn.collection('occurrences');
//   const cur = await col.find({ _version: { $ne: '2.0' } });
//   cur.forEach(async user => {
//     // double check this hasn't been updated yet
//     // due to mongo replacing objects in the cursor
//     // as we iterate
//     if (user.version === '2.0') {
//       return;
//     }
//     const newUser = migrateOcc(user);
//     await col.replaceOne({ id: user.id }, newUser);
//   });
// })();

// function hashEmail(email) {
//   return new Hashes.SHA1().hex(email);
// }
