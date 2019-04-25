import { get, setCompleted } from '../dao/milestones';

import { addRewardGiven } from '../dao/stats';

export function getMilestones(name) {
  return get(name);
}

export async function setMilestoneCompleted(name) {
  try {
    const { unsubscriptions } = await get(name);
    await setCompleted(name);
    return addRewardGiven(unsubscriptions);
  } catch (err) {
    throw err;
  }
}
