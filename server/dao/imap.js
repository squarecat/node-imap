import db, { isoDate } from './db';

import aes256 from 'aes256';
import logger from '../utils/logger';

const COL_NAME = 'imap';

export async function get(id, master) {
  let projection = {
    _id: 0
  };
  try {
    const col = await db().collection(COL_NAME);
    const data = await col.findOne({ id }, { fields: projection });
    return aes256.decrypt(master, data.password);
  } catch (err) {
    logger.error(`imap-dao: error getting imap data`);
    logger.error(err);
    throw err;
  }
}

export async function create(id, master, password) {
  try {
    const col = await db().collection(COL_NAME);
    return col.insertOne({
      id,
      password: aes256.encrypt(master, password),
      createdAt: isoDate()
    });
  } catch (err) {
    logger.error(`imap-dao: error setting imap data`);
    logger.error(err);
    throw err;
  }
}

export async function updatePassword(id, master, newPassword) {
  try {
    const col = await db().collection(COL_NAME);
    return col.updateOne(
      {
        id
      },
      {
        $set: {
          password: aes256.encrypt(master, newPassword),
          createdAt: isoDate()
        }
      }
    );
  } catch (err) {
    logger.error(`imap-dao: error setting imap data`);
    logger.error(err);
    throw err;
  }
}

export async function updateMasterKey(id, oldMaster, newMaster) {
  try {
    const col = await db().collection(COL_NAME);
    const password = await get(id, oldMaster);
    return col.updateOne(
      {
        id
      },
      {
        $set: {
          password: aes256.encrypt(newMaster, password),
          updatedAt: isoDate()
        }
      }
    );
  } catch (err) {
    logger.error(`imap-dao: error setting imap data`);
    logger.error(err);
    throw err;
  }
}
