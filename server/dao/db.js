import { MongoClient } from 'mongodb';
import config from 'getconfig';

export let url;

if (config.db.user) {
  url = `mongodb://${config.db.user}:${config.db.password}@${config.db.host}:${
    config.db.port
  }`;
} else {
  url = `mongodb://${config.db.host}:${config.db.port}/${config.db.name}`;
}

console.log(url);

const client = new MongoClient(url, { useNewUrlParser: true });

let dbClient = null;

export function connect() {
  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        console.error('db: error connecting');
        console.error(err);
        return reject(err);
      }
      console.log('db: connected');
      dbClient = client.db(config.db.name);
      return resolve(dbClient);
    });
  });
}

export function close() {
  return dbClient.close();
}

export default function db() {
  return dbClient;
}

export function isoDate(date) {
  // mongo has to take dates like this....
  if (date) {
    return new Date(new Date(date).toISOString());
  }
  return new Date(new Date().toISOString());
}
