import { MongoClient } from 'mongodb';
import config from 'getconfig';
import logger from '../utils/logger';

export const { url } = config.db;

const client = new MongoClient(url, { useNewUrlParser: true });

let connection = null;

export function connect() {
  return new Promise((resolve, reject) => {
    client.connect(err => {
      if (err) {
        logger.error('db: error connecting');
        logger.error(err);
        return reject(err);
      }
      logger.info('db: connected');
      connection = client.db(config.db.name);
      return resolve(connection);
    });
  });
}

export function close() {
  return connection.close();
}

export default function db() {
  return connection;
}

export function isoDate(date) {
  // mongo has to take dates like this....
  if (date) {
    return new Date(new Date(date).toISOString());
  }
  return new Date(new Date().toISOString());
}
