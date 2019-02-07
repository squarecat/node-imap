import format from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import logger from '../../utils/logger';
import subDays from 'date-fns/sub_days';
import subHours from 'date-fns/sub_hours';
import subMonths from 'date-fns/sub_months';
import subWeeks from 'date-fns/sub_weeks';
import url from 'url';

const googleDateFormat = 'YYYY/MM/DD';

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

export function getSearchString({ then, query = '' }) {
  const thenStr = format(then, googleDateFormat);
  return `after:${thenStr} ${query}`;
}

export function getUnsubValues(unsub) {
  try {
    let unsubscribeMailTo = null;
    let unsubscribeLink = null;
    if (/^<.+>,\s*<.+>$/.test(unsub)) {
      const unsubTypes = unsub
        .split(',')
        .map(a => a.trim().match(/^<(.*)>$/)[1]);
      unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
      unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
    } else if (/^<.+>,\s*.+$/.test(unsub)) {
      const unsubTypes = unsub.split(',').map(a => getUnsubValue(a));
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

export function getUnsubValue(str) {
  if (str.trim().match(/^<.+>$/)) {
    return str.substr(1, str.length - 2);
  }
  return str;
}

// a scan is available if it has not yet been
// completed, or it was completed in the last
// 24 hours
export function hasPaidScanAvailable(user, scanType) {
  const yesterday = subHours(Date.now(), 24);
  if (scanType === '3d' || user.beta) return true;
  return (user.paidScans || []).some(s => {
    if (s.scanType === scanType) {
      const performedWithin24Hrs = isAfter(s.paidAt, yesterday);
      return !s.performed || performedWithin24Hrs;
    }
    return false;
  });
}

export function isMailUnsubscribable(mail = {}, ignoredSenderList = []) {
  const { id, payload } = mail;

  if (!payload) {
    logger.warn(
      `mail-service: cannot check if unsubscribable, mail object has no payload ${id}`
    );
    if (!id) {
      logger.warn('mail-service: mail id undefined');
      logger.warn(mail);
    }
    return false;
  }

  try {
    const { headers = [] } = payload;
    const hasListUnsubscribe = headers.some(h => h.name === 'List-Unsubscribe');
    if (!hasListUnsubscribe) {
      return false;
    }
    const fromHeader = headers.find(h => h.name === 'From');
    if (!fromHeader) {
      logger.warn('mail-utils: email has no from header');
      return false;
    }
    const from = fromHeader.value;
    let pureFromEmail;
    if (from.match(/^.*<.*>/)) {
      const [, , email] = /^(.*)<(.*)>/.exec(from);
      pureFromEmail = email;
    } else {
      pureFromEmail = from;
    }
    const isIgnoredSender = ignoredSenderList.some(
      sender => sender === pureFromEmail
    );
    return !isIgnoredSender;
  } catch (err) {
    logger.error('Failed to determine if email is unsubscribable');
    logger.error(err);
    return false;
  }
}
