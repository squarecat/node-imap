const MongoClient = require('mongodb').MongoClient;
const shortid = require('shortid');

const url = `mongodb://colin:colinlovesmongo@db.leavemealone.xyz/leavemealone?authSource=admin`;

const client = new MongoClient(url, { useNewUrlParser: true });

let connection = null;
function connect() {
  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        console.error('db: error connecting');
        console.error(err);
        return reject(err);
      }
      console.log('db: connected');
      connection = client.db('leavemealone');
      return resolve(connection);
    });
  });
}

async function doFix() {
  try {
    const con = await connect();
    const col = await con.collection('users');
    console.log('got collection');
    const users = await col.find().toArray();
    console.log('got users');
    await Promise.all(
      users.map(u => {
        console.log('updating', u.id);
        return col.updateOne(
          { id: u.id },
          {
            $set: {
              referralCode: shortid.generate(),
              referrals: []
            }
          }
        );
      })
    );
  } catch (err) {
    console.error(err);
  }
}

doFix();
