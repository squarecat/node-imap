import { addActivity, incrementUnsubscribesRemaining } from '../../dao/user';

import _get from 'lodash.get';
import { getMilestones } from '../milestones';
import { getUserById } from './index';
import logger from '../../utils/logger';

export async function addActivityForUser(userId, name, data = {}) {
  try {
    logger.debug(`user-activity-service: adding activity ${name}`);

    let activityData = {
      type: name,
      data
    };

    const milestones = await getMilestones(name);
    const milestone = _get(milestones, name, {});

    // TODO improve nested IF statements
    if (milestone && milestone.hasReward) {
      logger.debug(
        `user-activity-service: activity ${name} has reward, checking if user is eligible`
      );

      // check if they are eligible for the reward
      const { activity = [] } = await getUserById(userId);
      const reward = getReward({
        userActivity: activity,
        name,
        milestone,
        activityData
      });

      if (reward) {
        const { unsubscriptions } = milestone;
        logger.debug(
          `user-activity-service: adding reward of ${unsubscriptions} to user ${userId}`
        );
        activityData = {
          ...activityData,
          ...reward
        };

        // give the user the unsubs
        await incrementUnsubscribesRemaining(userId, unsubscriptions);
      }
    }

    // add the activity to the array
    return addActivity(userId, activityData);
  } catch (err) {
    throw err;
  }
}

function getReward({ userActivity, name, milestone, activityData }) {
  const { maxRedemptions, unsubscriptions } = milestone;

  // conditions for reward
  // 1. user has not yet completed reward
  // 2. reward redemptions has not been reached and not been rewarded for the same data before
  // 3. reward has no max redemptions but has not been rewarded with the same data before
  let giveReward = false;

  const userActivityCompletionCount = userActivity.filter(a => a.type === name)
    .length;
  if (!userActivityCompletionCount) {
    // if the user has not yet completed the activity reward them
    giveReward = true;
  } else if (
    (maxRedemptions && userActivityCompletionCount < maxRedemptions) ||
    !maxRedemptions
  ) {
    // if the users redemptions are under the max or there are no max check the reward is not being gamed
    giveReward = checkReward({
      userActivity,
      activityData
    });
  }

  if (!giveReward) return null;

  logger.debug(
    `user-activity-service: conditions for reward met for activity ${name}`
  );
  return {
    reward: {
      unsubscriptions
    },
    // if it's a reward we add a notification
    // TODO what other use cases do we need to do this for?
    notification: {
      seen: false
    }
  };
}

function checkReward({ userActivity, activityData }) {
  const { type, data } = activityData;

  switch (type) {
    // connectedAdditionalAccount can only be done once per additional email
    case 'connectedAdditionalAccount': {
      const alreadyConnected = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyConnected) {
        logger.debug(
          `user-activity-service: user already redeemed reward for connecting this account`
        );
        return false;
      }
      return true;
    }
    // referralSignUp will only be rewarded once for each user that signed up
    case 'referralSignUp': {
      // TODO implement properly
      const alreadyReferred = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyReferred) {
        logger.debug(
          `user-activity-service: user already redeemed reward for referring this person`
        );
        return false;
      }
      return true;
    }
    // referralPurchase will only be rewarded once for each user that purchases
    case 'referralPurchase': {
      // TODO implement properly
      const alreadyPurchased = userActivity.find(
        a => a.type === type && a.data.id === data.id
      );
      if (alreadyPurchased) {
        logger.debug(
          `user-activity-service: user already redeemed reward for their referee purchasing a package`
        );
        return false;
      }
      return true;
    }
    default: {
      logger.debug(
        `user-activity-service: cannot check reward, reward not found ${type}`
      );
      return false;
    }
  }
}
