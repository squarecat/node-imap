import * as CommonUtils from '../common';

import Imap from '../../../vendor/node-imap';
import logger from '../../../utils/logger';

export function isMailUnsubscribable(headers = [], ignoredSenderList = []) {
  try {
    // check if ignored sender
    const fromHeader = getHeader(headers, 'from');
    if (!fromHeader) {
      logger.warn('imap-utils: email has no from header');
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
    // check list unsubscribe header
    let isUnsubscribable = getHeader(headers, 'List-Unsubscribe');
    // TODO check body content for "unsubscribe" if we have fetched the content
    return !isIgnoredSender && isUnsubscribable;
  } catch (err) {
    logger.error('imap-utils: failed to determine if email is unsubscribable');
    logger.error(err);
    return false;
  }
}

export function getHeader(headers, name) {
  return headers.find(h => h.name.toLowerCase() === name.toLowerCase());
}

export function getHeaderValue(headers, name) {
  const header = getHeader(headers, name);
  return header ? header.value : null;
}

export function getHeaders({ body }) {
  const parsed = Imap.parseHeader(body);
  return Object.keys(parsed).map(key => {
    return {
      name: key,
      value: parsed[key][0]
    };
  });
}

export function getUnsubValuesFromHeader(header) {
  return CommonUtils.getUnsubValues(header.value);
}

export const hasUnsubscribedAlready = CommonUtils.hasUnsubscribedAlready;
export const dedupeMailList = CommonUtils.dedupeMailList;
export const appendScores = CommonUtils.appendScores;
