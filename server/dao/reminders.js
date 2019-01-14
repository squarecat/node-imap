import { findUsersNeedReminders, updateUsersReminded } from './user';
import { sendReminderMail } from '../utils/email';
import { createCoupon } from '../utils/stripe';
import { products } from '../services/payments';
import { addReminderSentToStats } from '../services/stats';

export async function checkUserReminders() {
  console.log('reminders-dao: checking user reminders');

  const users = await findUsersNeedReminders();
  console.log(`reminders-dao: found ${users.length} users needing reminders`);

  if (!users.length) return true;

  await Promise.all(
    users.map(async ({ email, reminder }) => {
      console.log(`reminders-dao: sending mail to ${email}`);
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
