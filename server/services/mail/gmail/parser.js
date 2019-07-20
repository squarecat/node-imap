import {
  getHeader,
  getUnsubValues,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import logger from '../../../utils/logger';
import { parseEmail } from '../../../utils/parsers';

export function parseMailList(
  mailList = [],
  { ignoredSenderList, unsubscriptions }
) {
  return mailList.reduce((out, mailItem) => {
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
    const { parts, headers } = payload;
    // check headers first
    const unsubHeader = headers.find(h => h.name === 'List-Unsubscribe');
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
    const isTrash = labelIds.includes('TRASH');
    const isSpam = labelIds.includes('SPAM');
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
  return getUnsubValues(header.value);
}

function getUnsubValuesFromContent(mailParts) {
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
