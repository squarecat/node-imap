// import { addReferral, updateReferral } from '../dao/user';
// import { addReferralCreditToStats, addReferralPaidScanToStats } from './stats';
// import { creditUserAccount, getUserById } from './user';
// import {
//   sendReferralLinkUsedMail,
//   sendReferralRewardMail
// } from '../utils/emails/transactional';

// import config from 'getconfig';

// export function addReferralToReferrer(id, { userId, price, scanType }) {
//   return addReferral(id, { userId, price, scanType });
// }

// export async function updateReferralOnReferrer(
//   id,
//   { userId, price, scanType }
// ) {
//   const { referrals, email, referralCode } = await getUserById(id);
//   const { referrals: newReferrals } = await updateReferral(id, {
//     userId,
//     price,
//     scanType
//   });
//   const prevPaidReferrals = referrals.filter(r => r.price > 0);
//   const paidReferrals = newReferrals.filter(r => r.price > 0);

//   const hasNewReferrals = prevPaidReferrals.length !== paidReferrals.length;
//   if (!hasNewReferrals) {
//     return paidReferrals;
//   }
//   addReferralPaidScanToStats();
//   // new paid referral has been recorded, so do some things!
//   if (paidReferrals.length % 3 === 0) {
//     // credit account with 5 bucks
//     await creditUserAccount(id, 500);
//     addReferralCreditToStats({ amount: 5 });
//     sendReferralRewardMail({
//       toAddress: email,
//       rewardCount: paidReferrals.length / 3,
//       referralUrl: `${config.urls.referral}${referralCode}`
//     });
//   } else if (paidReferrals.length < 3) {
//     // we only send these if user has <3 referrals so we
//     // dont send too much spam if they are a big referrer
//     sendReferralLinkUsedMail({
//       toAddress: email,
//       referralUrl: `${config.urls.referral}${referralCode}`,
//       referralCount: paidReferrals.length
//     });
//   }
// }
