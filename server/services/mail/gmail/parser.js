import {
  getHeader,
  getUnsubValues,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import io from '@pm2/io';
import logger from '../../../utils/logger';
import { parseEmail } from '../../../utils/parsers';

const meter = io.meter({
  name: 'Gmail mail/hour',
  samples: 1,
  timeframe: 60
});

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
  { ignoredSenderList, unsubscriptions }
) {
  return mailList.reduce((out, mailItem) => {
    meter.mark();
    if (!mailItem || !isMailUnsubscribable(mailItem, ignoredSenderList)) {
      return out;
    }
    const mail = mapMail(mailItem);
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

function mapMail(mail) {
  const { payload, id, snippet, internalDate, labelIds } = mail;
  try {
    if (!payload) {
      throw new Error('mail object has no payload', id);
    }
    const { parts } = payload;
    // check headers first
    const unsubHeader = getHeader(payload, 'List-Unsubscribe');
    let unsubscribeMailTo, unsubscribeLink;
    if (unsubHeader) {
      ({ unsubscribeMailTo, unsubscribeLink } = getUnsubValuesFromHeader(
        unsubHeader
      ));
    } else {
      unsubscribeLink = getUnsubValuesFromContent(parts);
    }

    if (!unsubscribeMailTo && !unsubscribeLink) {
      return null;
    }
    const isTrash = labelIds && labelIds.includes('TRASH');
    const isSpam = labelIds && labelIds.includes('SPAM');
    const toHeader = getHeader(payload, 'to') || '';
    const { fromEmail: to } = parseEmail(toHeader, { unwrap: true });
    return {
      id,
      snippet,
      date: +internalDate,
      from: getHeader(payload, 'from') || '',
      to,
      subject: getHeader(payload, 'subject'),
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

function getUnsubValuesFromHeader(header) {
  return getUnsubValues(header);
}

function getUnsubValuesFromContent(mailParts) {
  if (!mailParts) return null;
  const html = mailParts.find(mp => mp.mimeType === 'text/html');
  if (!html) return false;
  const buff = new Buffer.from(html.body.data, 'base64');
  const content = buff.toString('ascii');
  const match = /<a[^>]*?href=["']([^<>]+?)["'][^>]*?>[^<>]*?unsubscribe[^<>]*?<\/a>/gi.exec(
    content
  );
  if (match) {
    return match[1];
  }
  return null;
}
