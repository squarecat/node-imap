import { addActivityForUser, getUserById } from './user';
import {
  sendReferralInviteMail,
  sendReferralSignUpMail
} from '../utils/emails/transactional';

import { addReferral } from '../dao/user';
import { addReferralSignupToStats } from './stats';
import config from 'getconfig';
import { getMilestone } from './milestones';
import logger from '../utils/logger';

export async function inviteReferralUser(userId, email) {
  try {
    const user = await getUserById(userId);
    const milestone = await getMilestone('referralSignUp');
    sendReferralInviteMail({
      toAddress: email,
      referrerName: user.name,
      referralCode: user.referralCode,
      reward: milestone.credits
    });
  } catch (err) {
    throw err;
  }
}

export async function getReferralStats(id) {
  try {
    const { referralCode, referrals, referredBy } = await getUserById(id);
    return { referralCode, referrals, referredBy };
  } catch (err) {
    throw err;
  }
}

export async function addReferralToBothUsers({ user, referredBy }) {
  try {
    logger.debug(
      `referral-service: adding referral activity. referee: ${
        user.id
      }, referrer: ${referredBy.id}`
    );
    // record that this user signed from a referral link and the details of the user they signed up from
    addActivityForUser(user.id, 'signedUpFromReferral', {
      id: referredBy.id,
      email: referredBy.email
    });

    logger.debug(`referral-service: adding activity for referredBy`);
    // record this user signing up on the user who referred them
    const referrerActivity = await addActivityForUser(
      referredBy.id, // update the referrer
      'referralSignUp',
      {
        id: user.id,
        email: user.email
      }
    );

    logger.debug(
      `referral-service: added ${referrerActivity.rewardCredits} credits`
    );

    // add this referral data to the referrer user account array
    const updatedReferredBy = await addReferral(referredBy.id, {
      id: user.id,
      email: user.email,
      // this can be 0 if this same user has signed up with this referral link before
      reward: referrerActivity.rewardCredits
    });

    addReferralSignupToStats();

    // email for the first 3 referrals
    const { referrals } = updatedReferredBy;
    if (referrerActivity.rewardCredits && referrals.length <= 3) {
      logger.debug(
        `referral-service: valid referral and less than 3 total, sending mail...`
      );
      sendReferralSignUpMail({
        toAddress: updatedReferredBy.email,
        toName: updatedReferredBy.name,
        referralUrl: `${config.urls.referral}${updatedReferredBy.referralCode}`,
        refereeName: user.name,
        reward: referrerActivity.rewardCredits
      });
    }
  } catch (err) {
    logger.error(
      `referral-service: error adding referral activity for user ${
        user.id
      }, referral user ${referredBy.id}`
    );
    throw err;
  }
}
