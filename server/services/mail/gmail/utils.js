import * as CommonUtils from '../common';

import format from 'date-fns/format';
import logger from '../../../utils/logger';

const googleDateFormat = 'YYYY/MM/DD';

export function getSearchString({ then, query = '' }) {
  const thenStr = format(then, googleDateFormat);
  return `after:${thenStr} ${query}`;
}

export function isMailUnsubscribable(mail = {}, ignoredSenderList = []) {
  const { id, payload } = mail;

  if (!payload) {
    logger.warn(
      `gmail-utils: cannot check if unsubscribable, mail object has no payload ${id}`
    );
    if (!id) {
      logger.warn('gmail-utils: mail id undefined');
      logError(mail);
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
      logger.warn('gmail-utils: email has no from header');
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
    logger.error('gmail-utils: failed to determine if email is unsubscribable');
    logger.error(err);
    return false;
  }
}

export function getHeader(payload, name) {
  const normalizedName = name.toLowerCase();
  const { headers } = payload;
  const header = headers.find(h => h.name.toLowerCase() === normalizedName);
  return header ? header.value : null;
}

function logError(mail) {
  try {
    logger.warn('gmail-utils: logging mail object');
    logger.warn(JSON.stringify(mail, null, 2));
    // errors often look like this
    // { error: { errors: [ [Object] ], code: 404, message: 'Not Found' } }
    // attempt to print the error
    if (mail.error) {
      if (mail.error.errors) {
        logger.warn(JSON.stringify(mail.error.errors, null, 2));
        mail.error.errors.map(e => logger.warn(JSON.stringify(e, null, 2)));
      } else {
        logger.warn(JSON.stringify(mail.error, null, 2));
      }
    }
    logger.warn('gmail-utils: finished logging mail object');
  } catch (err) {
    logger.error('gmail-utils: failed to log the mail error');
    logger.error(err);
    return false;
  }
}

export const getUnsubValues = CommonUtils.getUnsubValues;
export const getUnsubValue = CommonUtils.getUnsubValue;
export const hasUnsubscribedAlready = CommonUtils.hasUnsubscribedAlready;
export const getTimeRange = CommonUtils.getTimeRange;
export const hasPaidScanAvailable = CommonUtils.hasPaidScanAvailable;
