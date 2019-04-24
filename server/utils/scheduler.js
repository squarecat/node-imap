import Agenda from 'agenda';
import { checkUserReminders } from '../dao/reminders';
import logger from '../utils/logger';
import { url as mongoUrl } from '../dao/db';
import { recordStats } from '../dao/stats';

const agenda = new Agenda({ db: { address: mongoUrl } });

agenda.define('record day stats', async (job, done) => {
  logger.info('scheduler: recording day stats');
  try {
    await recordStats();
  } catch (err) {
    logger.error('scheduler: failed to record stats');
    logger.error(err);
  } finally {
    done();
  }
});

agenda.define('check user reminders', async (job, done) => {
  logger.info('scheduler: checking user reminders');
  try {
    await checkUserReminders();
  } catch (err) {
    logger.error('scheduler: failed to check reminders');
    logger.error(err);
  } finally {
    done();
  }
});

export async function startScheduler() {
  logger.info('scheduler: starting');
  agenda.on('ready', async () => {
    await agenda.start();
    await agenda.every('0 0 * * *', [
      'record day stats',
      'check user reminders'
    ]);
  });
}
