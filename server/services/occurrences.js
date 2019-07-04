import {
  addUnsubscribeOccurrence,
  getScores,
  refreshScores,
  updateOccurrences,
  updateOccurrencesSeen
} from '../dao/occurrences';

export function addOrUpdateOccurrences(userId, dupeInfo = []) {
  const occurrences = dupeInfo.reduce((out, dupeObject) => {
    return [
      ...out,
      Object.keys(dupeObject).map(d => ({
        sender: dupeObject[d].sender,
        occurrences: dupeObject[d].occurrences,
        isSpam: dupeObject[d].isSpam,
        isTrash: dupeObject[d].isTrash
      }))
    ];
  }, []);
  return updateOccurrences(userId, occurrences, '6m');
}

export function updateOccurrencesSeenByUser(userId, senders) {
  return updateOccurrencesSeen(userId, senders);
}

export function addNewUnsubscribeOccrurence(userId, from) {
  return addUnsubscribeOccurrence(userId, from);
}

export function getOccurrenceScores({ senders }) {
  return getScores(senders);
}

export function calculateOccurrenceScores() {
  return refreshScores();
}
