const Sentry = require('@sentry/node');

import {
  getOccurrenceScores,
  updateOccurrencesSeenByUser
} from '../../services/occurrences';

import { RestError } from '../../utils/errors';
import logger from '../../utils/logger';

export default async function occurrences(socket, userId, data) {
  try {
    updateOccurrencesSeenByUser(userId, data);
  } catch (err) {
    const error = new RestError('Failed to add occurrences', {
      userId: userId,
      cause: err
    });
    Sentry.captureException(error);
  }
}

export async function getScores(socket, userId, { senders }) {
  const scores = await getOccurrenceScores({ senders });
  logger.debug(`[socket]: => scores ${userId}`);
  return socket.emit('scores', scores);
}
