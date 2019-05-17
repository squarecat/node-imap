import { get, setCompleted } from '../dao/milestones';

export function getMilestones(name) {
  return get(name);
}

export async function getMilestone(name) {
  try {
    const milestone = await get(name);
    if (!milestone) return null;
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
