import { getDupeKey } from '../../utils/parsers';
import logger from '../../utils/logger';
import subDays from 'date-fns/sub_days';
import subMonths from 'date-fns/sub_months';
import subWeeks from 'date-fns/sub_weeks';
import url from 'url';

/**
 * Get the start and end dates from a timeframe
 */
export function getTimeRange(timeframe) {
  let then;
  const now = Date.now();
  const [value, unit] = timeframe;
  if (unit === 'd') {
    then = subDays(now, value);
  } else if (unit === 'w') {
    then = subWeeks(now, value);
  } else if (unit === 'm') {
    then = subMonths(now, value);
  }
  return { then, now };
}
/**
 * Parse the unsub header to get the URL
 * and MailTo values
 */
export function getUnsubValues(unsub) {
  try {
    let unsubscribeMailTo = null;
    let unsubscribeLink = null;
    if (/^<.+>,\s*<.+>$/.test(unsub)) {
      const unsubTypes = unsub.trim().match(/^<(.+)>,\s*<(.+)>$/) || [];
      unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
      unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
    } else if (/^<.+>,\s*.+$/.test(unsub)) {
      const unsubTypes = unsub.trim().match(/^<(.+)>,\s*(.+)$/) || [];
      unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
      unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
    } else if (unsub.startsWith('<http')) {
      unsubscribeLink = unsub.substr(1, unsub.length - 2);
    } else if (unsub.startsWith('<mailto')) {
      unsubscribeMailTo = unsub.substr(1, unsub.length - 2);
    } else if (url.parse(unsub).protocol === 'mailto') {
      unsubscribeMailTo = unsub;
    } else if (url.parse(unsub).protocol !== null) {
      unsubscribeLink = unsub;
    }
    return { unsubscribeMailTo, unsubscribeLink };
  } catch (err) {
    logger.error(`mail-utils: failed to get unsub values`);
    logger.error(unsub);
    logger.error(err);
    throw err;
  }
}

/**
 * Get value from unsub header string
 */
export function getUnsubValue(str) {
  if (str.trim().match(/^<.+>$/)) {
    return str.substr(1, str.length - 2);
  }
  return str;
}

/**
 * Check if the users has already unsubscribed from
 * this mail already
 */
export function hasUnsubscribedAlready(mail, unsubscriptions = []) {
  const unsubInfo = unsubscriptions.find(
    u => mail.from === u.from && mail.to === u.to
  );
  if (!unsubInfo) {
    return null;
  }
  const {
    unsubscribeStrategy,
    estimatedSuccess,
    resolved,
    hasImage
  } = unsubInfo;
  return {
    unsubStrategy: unsubscribeStrategy,
    estimatedSuccess,
    resolved,
    hasImage
  };
}

/**
 * Given a list of mail, dedupe it based on sender and reciever
 * output a occurance count for each mail and a deduped list
 */
export function dedupeMailList(
  dupeCache = {},
  mailList = [],
  dupeSenderCache = []
) {
  const { deduped, dupes, dupeSenders } = mailList.reduce(
    (out, mail) => {
      const dupeKey = getDupeKey(mail.from, mail.to);
      const dupeoccurrences = out.dupes[dupeKey] || 0;
      if (!dupeoccurrences) {
        const { isSpam, isTrash } = mail;
        return {
          deduped: [...out.deduped, mail],
          dupes: {
            ...out.dupes,
            [dupeKey]: 1
          },
          dupeSenders: {
            ...out.dupeSenders,
            [mail.from.toLowerCase()]: {
              sender: mail.from,
              occurrences: 1,
              isSpam,
              isTrash
            }
          }
        };
      }
      const { isSpam, isTrash } =
        out.dupeSenders[mail.from.toLowerCase()] || {};
      return {
        ...out,
        dupes: {
          ...out.dupes,
          [dupeKey]: dupeoccurrences + 1
        },
        dupeSenders: {
          ...out.dupeSenders,
          [mail.from.toLowerCase()]: {
            sender: mail.from,
            occurrences: dupeoccurrences + 1,
            isSpam: !!isSpam, // sometimes these are undefined
            isTrash: !!isTrash
          }
        }
      };
    },
    { dupes: dupeCache, deduped: [], dupeSenders: dupeSenderCache }
  );

  return { deduped, dupes, dupeSenders };
}
