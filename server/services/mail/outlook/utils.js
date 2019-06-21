import * as CommonUtils from '../common';

import format from 'date-fns/format';
import logger from '../../../utils/logger';

const outlookDateFormat = 'YYYY-MM-DD';

export function getSearchString({ from }) {
  const fromStr = format(from, outlookDateFormat);
  return `ReceivedDateTime gt ${fromStr}T00:00Z`;
}

export function isMailUnsubscribable(mail = {}, ignoredSenderList = []) {
  const { Id, InternetMessageHeaders: headers, From } = mail;
  if (!headers) {
    logger.warn(
      `outlook-utils: cannot check if unsubscribable, mail object has no headers ${Id}`
    );
    return false;
  }
  try {
    const hasListUnsubscribe = headers.some(h => h.Name === 'List-Unsubscribe');
    if (!hasListUnsubscribe) {
      return false;
    }
    const from = From.EmailAddress.Address;
    const isIgnoredSender = ignoredSenderList.some(sender => sender === from);
    return !isIgnoredSender;
  } catch (err) {
    logger.error(
      'outlook-utils: failed to determine if email is unsubscribable'
    );
    logger.error(err);
    return false;
  }
}

export function getHeader(mailItem, name) {
  const { InternetMessageHeaders: headers } = mailItem;
  return headers.find(h => h.Name.toLowerCase() === name.toLowerCase()).Value;
}

export const getUnsubValues = CommonUtils.getUnsubValues;
export const getUnsubValue = CommonUtils.getUnsubValue;
export const hasUnsubscribedAlready = CommonUtils.hasUnsubscribedAlready;
export const getTimeRange = CommonUtils.getTimeRange;
export const hasPaidScanAvailable = CommonUtils.hasPaidScanAvailable;
