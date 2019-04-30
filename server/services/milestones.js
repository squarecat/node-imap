import { get, setCompleted } from '../dao/milestones';

import { addRewardGiven } from '../dao/stats';
import { setUserMilestoneCompleted } from './user';

export function getMilestones(name) {
  return get(name);
}

export async function setMilestoneCompleted(name, user) {
  try {
    const { unsubscriptions } = await get(name);
    await setCompleted(name);
    await setUserMilestoneCompleted(user, { milestoneName: name });
    return addRewardGiven(unsubscriptions);
  } catch (err) {
    throw err;
  }
}
