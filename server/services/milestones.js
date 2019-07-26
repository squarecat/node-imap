import { get, setCompleted } from '../dao/milestones';

import { getUserById } from './user';
import logger from '../utils/logger';

export async function getMilestones({ userId } = {}) {
  try {
    const milestones = await get();
    if (!milestones) return null;
    if (userId) {
      const user = await getUserById(userId);
      if (!user) {
        return null;
      }
      const { milestones: userMilestones } = user;
      return Object.keys(milestones).reduce((out, key) => {
        const stone = milestones[key];
        let ms = {
          name: key,
          credits: stone.credits
        };
        if (userMilestones[key]) {
          ms = {
            ...ms,
            completed: true,
            timesCompleted: 1
          };
        }
        return [...out, ms];
      }, []);
    }
    return milestones;
  } catch (err) {
    logger.error(`failed to get milestones ${name}`);
    logger.error(err);
    throw err;
  }
}

export async function getMilestone(name) {
  try {
    const milestone = await get(name);
    return milestone[name];
  } catch (err) {
    logger.error(`failed to get milestone ${name}`);
    logger.error(err);
    throw err;
  }
}

export async function updateMilestoneCompletions(name) {
  try {
    return setCompleted(name);
  } catch (err) {
    logger.error(`failed to update milestone completions ${name}`);
    logger.error(err);
    throw err;
  }
}
