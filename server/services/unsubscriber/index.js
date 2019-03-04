import { addUnsubscriptionToStats } from '../stats';
import { addUnsubscriptionToUser } from '../user';
import { unsubscribeWithLink as browserUnsub } from './browser';
import { unsubscribeWithMailTo as emailUnsub } from './mail';
import logger from '../../utils/logger';

export const unsubscribeByLink = browserUnsub;
export const unsubscribeByMailTo = emailUnsub;

export const unsubscribeFromMail = async (userId, mail) => {
  const { unsubscribeLink, unsubscribeMailTo } = mail;
  logger.info(`mail-service: unsubscribe from ${mail.id}`);
  let unsubStrategy;
  let output;
  try {
    if (unsubscribeLink) {
      unsubStrategy = 'link';
      output = await unsubscribeByLink(unsubscribeLink);
    } else {
      unsubStrategy = 'mailto';
      output = await unsubscribeByMailTo(unsubscribeMailTo);
    }
    addUnsubscriptionToUser(userId, {
      mail,
      image: output.image,
      unsubscribeStrategy: unsubStrategy,
      unsubscribeLink,
      unsubscribeMailTo,
      estimatedSuccess: output.estimatedSuccess
    });
    if (output.estimatedSuccess) addUnsubscriptionToStats({ unsubStrategy });
    return {
      id: output.id,
      estimatedSuccess: output.estimatedSuccess,
      image: !!output.image,
      unsubStrategy
    };
  } catch (err) {
    logger.error(`mail-service: error unsubscribing from mail ${mail.id}`);
    logger.error(err);
    throw err;
  }
};
