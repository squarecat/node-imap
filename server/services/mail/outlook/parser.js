import {
  getHeader,
  getUnsubValues,
  hasUnsubscribedAlready,
  isMailUnsubscribable
} from './utils';

import logger from '../../../utils/logger';

const ignoreMailFrom = ['Outbox', 'Sent Items', 'Drafts'];
export function parseMailList(
  mailList = [],
  { ignoredSenderList, unsubscriptions, mailFolders } = {}
) {
  return mailList.reduce((out, mailItem) => {
    try {
      if (!mailItem || !isMailUnsubscribable(mailItem, ignoredSenderList)) {
        return out;
      }
      const { ParentFolderId } = mailItem;
      const hasFolder = mailFolders.find(
        folder => folder.Id === ParentFolderId
      );
      const folderName = hasFolder ? hasFolder.DisplayName : '';
      if (ignoreMailFrom.includes(folderName)) {
        return out;
      }
      const mail = mapMail(mailItem, {
        isTrash: folderName === 'Deleted Items',
        isSpam: folderName === 'Junk Email'
      });
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
    } catch (err) {
      logger.error(`outlook-parser: failed to parse mail - ${err.message}`);
      return out;
    }
  }, []);
}

function mapMail(mailItem, { isSpam, isTrash }) {
  const { Id: id, From, Subject, BodyPreview, ToRecipients } = mailItem;
  const { Address: from, Name: name } = From.EmailAddress;
  const unsub = getHeader(mailItem, 'list-unsubscribe');
  const date = getHeader(mailItem, 'date');
  const to = ToRecipients[0] ? ToRecipients[0].EmailAddress.Address : '';
  const { unsubscribeMailTo, unsubscribeLink } = getUnsubValues(unsub);
  if (!unsubscribeMailTo && !unsubscribeLink) {
    return null;
  }

  return {
    id,
    snippet: BodyPreview,
    date: +new Date(date),
    from: `${name}<${from}>`,
    to,
    subject: Subject,
    unsubscribeLink,
    unsubscribeMailTo,
    isTrash,
    isSpam
  };
}
