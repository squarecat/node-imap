import { addReferral, updateReferral } from '../dao/user';
import { getUser, creditUserAccount } from './user';

export function addReferralToReferrer(id, { userId, price, scanType }) {
  return addReferral(id, { userId, price, scanType });
}

export async function updateReferralOnReferrer(
  id,
  { userId, price, scanType }
) {
  const { referrals } = await getUser(id);
  const { referrals: newReferrals } = await updateReferral(id, {
    userId,
    price,
    scanType
  });
  const prevPaidReferrals = referrals.filter(r => r.price > 0);
  const paidReferrals = newReferrals.filter(r => r.price > 0);

  const hasNewReferrals = prevPaidReferrals.length !== paidReferrals.length;
  if (!hasNewReferrals) {
    return paidReferrals;
  }
  // new paid referral has been recorded, so do some things!
  if (paidReferrals.length % 3 === 0) {
    // credit account with 5 bucks
    await creditUserAccount(id, 500);
    // TODO send credit earnied email
  } else if (paidReferrals.length < 3) {
    // TODO send "someone used your referral link" email
    // we only send these if user has <3 referrals so we
    // dont send too much spam if they are a big referrer
  }
}
