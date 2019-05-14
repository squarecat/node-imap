import { addActivity, incrementUnsubscribesRemaining } from '../../dao/user';

import { getMilestones } from '../milestones';
import { getUserById } from './index';
import logger from '../../utils/logger';

export async function addActivityForUser(userId, name, data = {}) {
  try {
    logger.debug(`user-activity-service: adding activity ${name}`);

    const milestone = await getMilestones(name);
    const { hasReward, maxRedemptions, unsubscriptions } = milestone[name];

    let activityData = {
      type: name,
      data
    };

    if (hasReward) {
      logger.debug(
        `user-activity-service: activity ${name} has reward of ${unsubscriptions} unsubs`
      );

      // check if they are eligible for the reward
      const user = await getUserById(userId);

      // how many times they have this activty already
      const userMilestoneCompletionCount = user.activity.filter(
        a => a.type === name
      ).length;

      // conditions for adding unsubs
      // 1. user has not yet completed reward
      // 2. reward redemptions has not been reached
      const giveReward =
        !userMilestoneCompletionCount ||
        (maxRedemptions && userMilestoneCompletionCount < maxRedemptions);

      // TODO improve nested if statement
      if (giveReward) {
        logger.debug(
          `user-activity-service: conditions for reward met adding ${unsubscriptions} unsubs to user ${userId}`
        );
        activityData = {
          ...activityData,
          reward: {
            unsubscriptions
          },
          // if it's a reward we add a notification
          // TODO what other use cases do we need to do this for?
          notification: {
            seen: false
          }
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
