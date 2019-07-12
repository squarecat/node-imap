import { checkUserReminders } from '../dao/reminders';
import logger from '../utils/logger';
import { recordStats } from '../dao/stats';

async function recordDailyStats() {
  try {
    await recordStats();
  } catch (err) {
    logger.error('scheduler: failed to record stats');
    logger.error(err);
  }
}

async function checkReminders() {
  try {
    await checkUserReminders();
  } catch (err) {
    logger.error('scheduler: failed to check reminders');
    logger.error(err);
  }
}

async function daily() {
  logger.info('scheduler: daily schedule starting');
  await recordDailyStats();
  await checkReminders();
  logger.info('scheduler: daily schedule complete');
}

export default async function run(schedule) {
  if (schedule === 'daily') {
    return daily();
  }
  throw new Error(`scheduler: schedule ${schedule} not implemented`);
}
