import { setDelinquent } from './delinquent';
import { updateOccurrences as update } from './frequencies';
import { updateHeart } from './hearts';
import { updateOccurrencesSeen as updateSeen } from './seen';
import { updateOccurrenceUnsubscribed as updateUnsubscribed } from './unsubscribed';

export const updateOccurrenceUnsubscribed = updateUnsubscribed;
export const updateOccurrences = update;
export const updateOccurrencesSeen = updateSeen;
export const updateOccurrenceHearts = updateHeart;
export const setSenderDelinquent = setDelinquent;
