import { findUsersNeedReminders, updateUsersReminded } from './user';

import { addReminderSentToStats } from '../services/stats';
import { createCoupon } from '../utils/stripe';
import logger from '../utils/logger';
import { products } from '../services/payments';
import { sendReminderMail } from '../utils/emails/transactional';

export async function checkUserReminders() {
  try {
    const users = await findUsersNeedReminders();
    logger.info(`reminders-dao: found ${users.length} users needing reminders`);

    if (!users.length) return true;

    await Promise.all(
      users.map(async ({ email, reminder }) => {
        logger.info(`reminders-dao: sending mail to ${email}`);
        const coupon = await generateCoupon(reminder.timeframe);
        sendReminderMail({
          toAddress: email,
          reminderPeriod: getTimeframeText(reminder.timeframe, email),
          coupon
        });
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
  const product = products.find(p => p.value === timeframe);
  return product.label;
}
