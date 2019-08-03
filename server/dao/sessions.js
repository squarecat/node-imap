import db from './db';
import logger from '../utils/logger';

export async function get(userId) {
  try {
    const col = await db().collection('sessions');
    const sessionData = await col.findOne({ 'session.userId': userId });
    if (!sessionData) return null;
    const { session } = sessionData;
    return session;
  } catch (err) {
    logger.error(`session-dao: error fetching session ${userId}`);
    logger.error(err);
    throw err;
  }
}
