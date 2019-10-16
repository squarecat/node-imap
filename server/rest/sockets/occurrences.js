const Sentry = require('@sentry/node');

import { RestError } from '../../utils/errors';
import logger from '../../utils/logger';
import { updateOccurrencesSeenByUser } from '../../services/occurrences';

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
