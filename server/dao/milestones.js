import db, { isoDate } from './db';

import logger from '../utils/logger';

const COL_NAME = 'milestones';

export async function get(name) {
  let projection = {
    _id: 0
  };
  if (name) {
    projection = {
      ...projection,
      [name]: 1
    };
  }
  try {
    const col = await db().collection(COL_NAME);
    return col.findOne({}, projection);
  } catch (err) {
    logger.error(`milestone-dao: error getting milestones`);
    logger.error(err);
    throw err;
  }
}

export async function setCompleted(name) {
  try {
    const col = await db().collection(COL_NAME);
    return col.updateOne(
      {},
      {
        $inc: { [`${name}.timesCompleted`]: 1 },
        $set: { [`${name}.lastCompleted`]: isoDate() }
      }
    );
  } catch (err) {
    logger.error(`milestone-dao: error getting milestones`);
    logger.error(err);
    throw err;
  }
}
