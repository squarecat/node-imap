import { addNewUnsubscribeOccrurence } from '../occurrences';
import { addUnsubscriptionToStats } from '../stats';
import {
  addUnsubscriptionToUser,
  getUserById,
  incrementUserCredits,
  decrementUserCredits
} from '../user';
import { recordUnsubscribeForOrganisation } from '../organisation';
import { unsubscribeWithLink as browserUnsub } from './browser';
import { unsubscribeWithMailTo as emailUnsub } from './mail';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import logger from '../../utils/logger';
import { UserError } from '../../utils/errors';

export const unsubscribeByLink = browserUnsub;
export const unsubscribeByMailTo = emailUnsub;

export const unsubscribeFromMail = async (userId, mail) => {
  const { billing, organisationId, organisationActive } = await getUserById(
    userId
  );
  const credits = billing ? billing.credits : 0;
  const { allowed, reason } = canUnsubscribe({
    credits,
    organisationId,
    organisationActive
  });
  if (!allowed) {
    throw new UserError(`unsubscribe failed - ${reason}`, {
      errKey: reason
    });
  }

  if (!organisationId) {
    decrementUserCredits(userId, 1);
  } else {
    recordUnsubscribeForOrganisation(organisationId);
  }
  const { unsubscribeLink, unsubscribeMailTo } = mail;
  logger.info(`unsubscriber-service: unsubscribe from ${mail.id}`);
  let unsubStrategy;
  let output;
  let hasImage = false;
  try {
    if (unsubscribeLink) {
      unsubStrategy = 'link';
      output = await unsubscribeByLink(unsubscribeLink);
      hasImage = !!output.image;
    } else {
      unsubStrategy = 'mailto';
      output = await unsubscribeByMailTo({
        mailId: mail.id,
        userId,
        unsubMailto: unsubscribeMailTo
      });
    }
    if (hasImage) {
      saveImageToDisk(userId, mail.id, output.image);
    }
    addUnsubscriptionToUser(userId, {
      mail,
      unsubscribeStrategy: unsubStrategy,
      unsubscribeLink,
      unsubscribeMailTo,
      hasImage,
      estimatedSuccess: output.estimatedSuccess
    });
    if (output.estimatedSuccess) {
      addUnsubscriptionToStats({ unsubStrategy });
    } else if (!organisationId) {
      incrementUserCredits(userId, 1);
    }
    addNewUnsubscribeOccrurence(userId, mail.from);
    return {
      id: output.id,
      estimatedSuccess: output.estimatedSuccess,
      hasImage,
      unsubStrategy
    };
  } catch (err) {
    logger.error(
      `unsubscriber-service: error unsubscribing from mail ${mail.id}`
    );
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

function canUnsubscribe({ credits, organisationId, organisationActive }) {
  if (organisationId && !organisationActive) {
    logger.debug('unsubscriber-service: organisation inactive');
    return {
      allowed: false,
      reason: 'organisation-inactive'
    };
  } else if (!organisationId && credits <= 0) {
    logger.debug('unsubscriber-service: insufficient credits');
    return {
      allowed: false,
      reason: 'insufficient-credits'
    };
  }
  return { allowed: true };
}
