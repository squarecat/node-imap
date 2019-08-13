import db, { isoDate } from './db';

import logger from '../utils/logger';

const COL_NAME = 'audit';

async function createGroup(userId, groupId, { group, messages }) {
  const col = await db().collection(COL_NAME);
  return col.updateOne(
    {
      userId
    },
    {
      $push: {
        logs: {
          startedAt: isoDate(),
          group,
          groupId,
          messages: messages
        }
      }
    },
    { upsert: true }
  );
}

export async function append(userId, groupId, { group, messages }) {
  try {
    const col = await db().collection(COL_NAME);
    const groupExists = await col.findOne({
      userId,
      'logs.groupId': groupId
    });
    if (!groupExists) {
      return createGroup(userId, groupId, { group, messages });
    }
    return col.updateOne(
      {
        userId,
        'logs.groupId': groupId
      },
      {
        $set: {
          lastUpdated: isoDate()
        },
        $pushAll: {
          [`logs.$.messages`]: messages
        }
      }
    );
  } catch (err) {
    logger.error(`audit-dao: error adding log to user`);
    logger.error(err);
    throw err;
  }
}

export async function get(userId) {
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({ userId });
  } catch (err) {
    logger.error(`audit-dao: error getting audit data for user`);
    logger.error(err);
    throw err;
  }
}
