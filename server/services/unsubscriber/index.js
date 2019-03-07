import { addUnsubscriptionToStats } from '../stats';
import { addUnsubscriptionToUser } from '../user';
import { unsubscribeWithLink as browserUnsub } from './browser';
import { unsubscribeWithMailTo as emailUnsub } from './mail';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
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
      saveImageToDisk(userId, mail.id, output.image);
    } else {
      unsubStrategy = 'mailto';
      output = await unsubscribeByMailTo(unsubscribeMailTo);
    }
    addUnsubscriptionToUser(userId, {
      mail,
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

function saveImageToDisk(userId, mailId, image) {
  const dir = `${imageStoragePath}/${userId}`;
  const path = `${dir}/${mailId}.png`;
  return new Promise((good, bad) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    fs.writeFile(path, image, 'binary', err => {
      if (err) {
        return bad(err);
      }
      return good();
    });
  });
}
