import { findUsersNeedReminders, updateUsersReminded } from './user';

import { addReminderSentToStats } from '../services/stats';
import { addUserReminder } from '../services/user';
import { createCoupon } from '../utils/stripe';
import logger from '../utils/logger';
import { sendReminderMail } from '../utils/emails/transactional';

const timeframes = {
  '1w': '1 week',
  '1m': '1 month',
  '3m': '3 months',
  '6m': '6 months'
};

export async function checkUserReminders() {
  try {
    const users = await findUsersNeedReminders();
    logger.info(`reminders-dao: found ${users.length} users needing reminders`);

    if (!users.length) return true;

    await Promise.all(
      users.map(async ({ id, email, name, reminder }) => {
        const { timeframe, recurring } = reminder;
        logger.info(`reminders-dao: generating reminder coupon for ${id}`);
        const coupon = await generateCoupon(timeframe);
        sendReminderMail({
          toAddress: email,
          toName: name,
          reminderPeriod: getTimeframeText(timeframe),
          coupon
        });
        // re-add the reminder for the current timeframe
        // if it's set to reoccur
        if (recurring) {
          addUserReminder(id, { timeframe, recurring });
        }
      })
    );

    addReminderSentToStats(users.length);
    await updateUsersReminded(users.map(u => u._id));
  } catch (err) {
    logger.error('reminders-dao: failed to check user reminders');
    logger.error(err);
  }
}

async function generateCoupon(timeframe, email) {
  const { id: couponId } = await createCoupon({
    percent_off: 10,
    metadata: { reminder: true, email }
  });
  return couponId;
}

function getTimeframeText(timeframe) {
  return timeframes[timeframe];
}
