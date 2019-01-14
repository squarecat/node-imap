import Agenda from 'agenda';

import { url as mongoUrl } from '../dao/db';
import { recordStats } from '../dao/stats';
import { checkUserReminders } from '../dao/reminders';

const agenda = new Agenda({ db: { address: mongoUrl } });

agenda.define('record day stats', async (job, done) => {
  console.log('scheduler: recording day stats');
  await recordStats();
  done();
});

agenda.define('check user reminders', async (job, done) => {
  console.log('scheduler: checking user reminders');
  await checkUserReminders();
  done();
});

export async function startScheduler() {
  console.log('starting scheduler');
  agenda.on('ready', async () => {
    await agenda.start();
    await agenda.every('0 0 * * *', [
      'record day stats',
      'check user reminders'
    ]);
  });
}
