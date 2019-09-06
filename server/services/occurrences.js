import {
  getScores,
  refreshScores,
  setSenderDelinquent,
  updateOccurrenceHearts,
  updateOccurrenceUnsubscribed,
  updateOccurrences,
  updateOccurrencesSeen
} from '../dao/occurrences';

export function addOrUpdateOccurrences(userId, dupeInfo = []) {
  const occurrences = dupeInfo.reduce((out, dupeObject) => {
    return [
      ...out,
      ...Object.keys(dupeObject).map(d => ({
        sender: dupeObject[d].sender,
        occurrences: dupeObject[d].occurrences,
        isSpam: dupeObject[d].isSpam,
        isTrash: dupeObject[d].isTrash
      }))
    ];
  }, []);
  return updateOccurrences(userId, occurrences, '6m');
}

export function setSenderAsDelinquent(sender) {
  return setSenderDelinquent(sender);
}

export function updateOccurrenceHearted(sender, isHearted) {
  return updateOccurrenceHearts(sender, isHearted);
}

export function updateOccurrencesSeenByUser(userId, senders) {
  return updateOccurrencesSeen(userId, senders);
}

export function addNewUnsubscribeOccrurence(userId, from) {
  return updateOccurrenceUnsubscribed(userId, from);
}

export function getOccurrenceScores({ senders }) {
  return getScores(senders);
}

export function calculateOccurrenceScores() {
  return refreshScores();
}

export function setSenderAsDelinquent