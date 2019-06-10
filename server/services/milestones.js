import { get, setCompleted } from '../dao/milestones';

import { getUserById } from './user';

export async function getMilestones({ name, userId } = {}) {
  try {
    const milestones = await get(name);
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
          unsubscriptions: stone.unsubscriptions
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
  } catch (err) {
    throw err;
  }
}

export async function getMilestone(name) {
  try {
    const milestone = await get(name);
    return milestone[name];
  } catch (err) {
    throw err;
  }
}

export async function updateMilestoneCompletions(name) {
  try {
    return setCompleted(name);
  } catch (err) {
    throw err;
  }
}
