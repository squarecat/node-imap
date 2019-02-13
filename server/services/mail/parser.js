import {
  getUnsubValues,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import logger from '../../utils/logger';

export default function parseMailList(
  mailList = [],
  { ignoredSenderList, unsubscriptions }
) {
  return mailList.reduce((out, mailItem) => {
    const mail = mapMail(mailItem);
    if (!mail || !isMailUnsubscribable(mail, ignoredSenderList)) {
      return out;
    }
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
      googleDate: internalDate,
      from: payload.headers.find(h => h.name === 'From').value,
      to: payload.headers.find(h => h.name === 'To').value,
      subject: payload.headers.find(h => h.name === 'Subject').value,
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
