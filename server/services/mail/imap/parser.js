import {
  getHeader,
  getHeaderValue,
  getHeaders,
  getUnsubValuesFromHeader,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import logger from '../../../utils/logger';
import { parseEmail } from '../../../utils/parsers';

/**
 * Parser considerations
 *
 * - Every mail item passed in has already been checked to determine
 *   if it is unsubscribable
 * - Even though it is unsubscribably, the format of the headers might be
 *   wrong and we can't do anything with them
 * - Any property can be undefined, how we parse depends on if any critical parts are missing
 * - We should always try and continue without errors, catches are swallowed
 *   so that the parsing as a whole doesn't break
 */
export function parseMailList(
  mailList = [],
  { ignoredSenderList = [], unsubscriptions = [] }
) {
  return mailList.reduce((out, mailItem) => {
    if (!mailItem) {
      return out;
    }
    const headers = getHeaders(mailItem);
    const isUnsubscribable = isMailUnsubscribable(headers, ignoredSenderList);
    if (!isUnsubscribable) {
      return out;
    }
    const mail = parseMailItem(mailItem);
    if (mail) {
      const prevUnsubscriptionInfo = hasUnsubscribedAlready(
        mail,
        unsubscriptions
      );
      let outputMail;
      if (prevUnsubscriptionInfo) {
        outputMail = {
          ...mail,
          ...prevUnsubscriptionInfo,
          subscribed: false
        };
      } else {
        outputMail = { ...mail, subscribed: true };
      }
      return [...out, outputMail];
    }
    return out;
  }, []);
}

function parseMailItem(item) {
  const headers = getHeaders(item);
  try {
    if (!headers.length) {
      throw new Error('mail object has no headers');
    }
    // check headers first
    const unsubHeader = getHeader(headers, 'List-Unsubscribe');
    let unsubscribeMailTo, unsubscribeLink;
    if (unsubHeader) {
      ({ unsubscribeMailTo, unsubscribeLink } = getUnsubValuesFromHeader(
        unsubHeader
      ));
    } else {
      // todo
      // unsubscribeLink = getUnsubValuesFromContent(parts);
    }

    if (!unsubscribeMailTo && !unsubscribeLink) {
      return null;
    }
    const { id, date, mailbox } = item;
    let isTrash = false;
    let isSpam = false;
    if (mailbox.box && mailbox.box.attribs) {
      isTrash = mailbox.box.attribs.includes('\\Trash');
      isSpam = mailbox.box.attribs.includes('\\Junk');
    }
    const toHeader = getHeaderValue(headers, 'to');
    const { fromEmail: to } = parseEmail(toHeader, { unwrap: true });
    const lmaId = `${id}-${+date}`;
    return {
      id: lmaId,
      uid: id,
      date: +date,
      from: getHeaderValue(headers, 'from') || '',
      to,
      subject: getHeaderValue(headers, 'subject'),
      unsubscribeLink,
      unsubscribeMailTo,
      isTrash,
      isSpam
    };
  } catch (err) {
    logger.error('mail-service: error mapping mail');
    logger.error(err);
    return null;
  }
}
