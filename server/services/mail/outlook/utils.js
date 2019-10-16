import * as CommonUtils from '../common';

import format from 'date-fns/format';
import logger from '../../../utils/logger';

const outlookDateFormat = 'YYYY-MM-DD';
const outlookSearchFormat = 'MM/DD/YYYY';

export function getFilterString({ from }) {
  const fromStr = format(from, outlookDateFormat);
  return `ReceivedDateTime gt ${fromStr}T00:00Z`;
}

export function getSearchString({ from, query }) {
  // const fromStr = format(from, outlookSearchFormat);
  return `"Body:${query} and Received:>${fromStr}"`;
  return query;
}

export function isMailUnsubscribable(mail = {}, ignoredSenderList = []) {
  const { InternetMessageHeaders: headers, From, Body } = mail;
  if (!headers && !Body) {
    logger.debug(
      `outlook-utils: cannot check if unsubscribable, mail object has no headers or body`
    );
    return false;
  }
  try {
    let isUnsubscribable;
    if (headers) {
      isUnsubscribable = headers.some(h => h.Name === 'List-Unsubscribe');
    }
    if (!isUnsubscribable && Body) {
      isUnsubscribable = isMailContentUnsubscribable(Body);
    }
    const from = From.EmailAddress.Address;
    const isIgnoredSender = ignoredSenderList.some(sender => sender === from);
    return !isIgnoredSender && isUnsubscribable;
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

function isMailContentUnsubscribable(body) {
  return /<a[^>]*?href=["']([^<>]+?)["'][^>]*?>[^<>]*?unsubscribe[^<>]*?<\/a>/gi.test(
    body.Content
  );
}

export const getUnsubValues = CommonUtils.getUnsubValues;
export const getUnsubValue = CommonUtils.getUnsubValue;
export const hasUnsubscribedAlready = CommonUtils.hasUnsubscribedAlready;
export const getTimeRange = CommonUtils.getTimeRange;
export const appendScores = CommonUtils.appendScores;
