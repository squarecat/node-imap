import {
  getHeader,
  getUnsubValues,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import logger from '../../../utils/logger';

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
    const unsub = payload.headers.find(h => h.name === 'List-Unsubscribe')
      .value;
    const { unsubscribeMailTo, unsubscribeLink } = getUnsubValues(unsub);
    if (!unsubscribeMailTo && !unsubscribeLink) {
      return null;
    }
    const isTrash = labelIds.includes('TRASH');
    const isSpam = labelIds.includes('SPAM');
    return {
      id,
      snippet,
      date: internalDate,
      googleDate: internalDate,
      from: getHeader(payload, 'from'),
      to: getHeader(payload, 'to'),
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
