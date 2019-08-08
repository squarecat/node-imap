import { recordStats, recordStatsMonthly } from '../dao/stats';

import { checkUserReminders } from '../dao/reminders';
import logger from '../utils/logger';

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

async function recordMonthlyStats() {
  try {
    await recordStatsMonthly();
  } catch (err) {
    logger.error('scheduler: failed to record stats monthly');
    logger.error(err);
  }
}

async function daily() {
  logger.info('scheduler: daily schedule starting');
  await recordDailyStats();
  await checkReminders();
  logger.info('scheduler: daily schedule complete');
}

async function monthly() {
  logger.info('scheduler: monthly schedule starting');
  await recordMonthlyStats();
  logger.info('scheduler: monthly schedule complete');
}

export default async function run(schedule) {
  if (schedule === 'daily') {
    return daily();
  }
  if (schedule === 'monthly') {
    return monthly();
  }
  throw new Error(`scheduler: schedule ${schedule} not implemented`);
}
