import db, { isoDate } from './db';

import logger from '../utils/logger';

const COL_NAME = 'occurances';

export async function updateOccurances(occrurences) {
  try {
    const col = await db().collection(COL_NAME);
    await col.bulkWrite(
      occrurences.map(o => ({
        updateOne: {
          filter: {
            sender: o.sender
          },
          update: {
            $inc: {
              occurances: 1
            },
            $push: {
              sixMonthFrequencies: o.sixMonthFrequency
            },
            $set: {
              lastUpdated: isoDate()
            }
          }
        }
      })),
      { ordered: false }
    );
  } catch (err) {
    logger.error(`stats-dao: error bulk updating occurences`);
    logger.error(err);
    throw err;
  }
}

// function updateAverages() {}
