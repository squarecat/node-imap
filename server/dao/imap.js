import db, { isoDate } from './db';

import aes256 from 'aes256';
import logger from '../utils/logger';

const COL_NAME = 'imap';

export async function get(id, masterKey) {
  let projection = {
    _id: 0
  };
  try {
    const col = await db().collection(COL_NAME);
    const data = await col.findOne({ id }, { fields: projection });
    return aes256.decrypt(masterKey, data.password);
  } catch (err) {
    logger.error(`imap-dao: error getting imap data`);
    logger.error(err);
    throw err;
  }
}

export async function set(id, { masterKey, password }) {
  try {
    const col = await db().collection(COL_NAME);
    return col.insertOne({
      id,
      password: aes256.encrypt(masterKey, password),
      createdAt: isoDate()
    });
  } catch (err) {
    logger.error(`imap-dao: error setting imap data`);
    logger.error(err);
    throw err;
  }
}

export async function remove(id) {
  try {
    const col = await db().collection(COL_NAME);
    return col.removeOne({
      id
    });
  } catch (err) {
    logger.error(`imap-dao: error removing imap data`);
    logger.error(err);
    throw err;
  }
}

export async function update(id, { masterKey, password }) {
  try {
    const col = await db().collection(COL_NAME);
    return col.updateOne(
      {
        id
      },
      {
        $set: {
          password: aes256.encrypt(masterKey, password),
          lastUpdatedAt: isoDate()
        }
      }
    );
  } catch (err) {
    logger.error(`imap-dao: error setting imap data`);
    logger.error(err);
    throw err;
  }
}
