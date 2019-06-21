import {
  addUnsubscribeOccrurence,
  getScores,
  refreshScores,
  updateOccurrences
} from '../dao/occurrences';

export function addOrUpdateOccurrences(userId, dupeInfo) {
  const occurrences = Object.keys(dupeInfo).map(d => ({
    sender: dupeInfo[d].sender,
    occurrences: dupeInfo[d].occurrences,
    isSpam: dupeInfo[d].isSpam,
    isTrash: dupeInfo[d].isTrash
  }));
  return updateOccurrences(userId, occurrences, '6m');
}

export function addNewUnsubscribeOccrurence(userId, from) {
  return addUnsubscribeOccrurence(userId, from);
}

export function getOccurrenceScores({ senders }) {
  return getScores(senders);
}

export function calculateOccurrenceScores() {
  return refreshScores();
}
