import {
  addUnsubscribeActivityToUser,
  addUnsubscriptionToUser,
  getUserById,
  incrementCreditsUsedForUser,
  incrementUserCredits
} from '../user';

import { UserError } from '../../utils/errors';
import { addNewUnsubscribeOccrurence } from '../occurrences';
import { addUnsubscriptionToStats } from '../stats';
import { unsubscribeWithLink as browserUnsub } from './browser';
import { unsubscribeWithMailTo as emailUnsub } from './mail';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import logger from '../../utils/logger';
import { recordUnsubscribeForOrganisation } from '../organisation';
import { sendToUser } from '../../rest/sockets';
import uuid from 'node-uuid';

export const unsubscribeByLink = browserUnsub;
export const unsubscribeByMailTo = emailUnsub;

export const unsubscribeFromMail = async (userId, mail) => {
  const {
    billing,
    organisationId,
    organisationActive,
    unsubscriptions,
    milestones
  } = await getUserById(userId);
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
    logger.debug(
      `unsubscriber-service: preparing to unsubscribe decrementing user credits by 1`
    );
    incrementUserCredits(userId, -1);
    sendToUser(userId, 'update-credits', -1, { skipBuffer: true });
  }
  const { unsubscribeLink, unsubscribeMailTo } = mail;
  logger.info(`unsubscriber-service: unsubscribe from ${mail.id}`);
  let unsubStrategy;
  let output;
  let hasImage = false;
  const unsubscribeId = uuid.v1();
  try {
    const mailData = {
      mail,
      unsubscribeLink,
      unsubscribeMailTo
    };
    if (unsubscribeLink) {
      unsubStrategy = 'link';
      output = await unsubscribeByLink(unsubscribeLink);
      hasImage = !!output.image;
      if (hasImage) {
        saveImageToDisk(userId, mail.id, output.image);
      }
      addUnsubscriptionToUser(userId, {
        ...mailData,
        hasImage,
        unsubscribeId,
        unsubscribeStrategy: unsubStrategy,
        estimatedSuccess: output.estimatedSuccess
      });
    } else {
      unsubStrategy = 'mailto';
      // in case the email response comes back faster
      // than we can save to the db, do the db save first
      // and then do the mailto unsubscribe
      await addUnsubscriptionToUser(userId, {
        ...mailData,
        unsubscribeId,
        hasImage,
        unsubscribeStrategy: unsubStrategy,
        estimatedSuccess: true
      });
      output = await unsubscribeByMailTo({
        mailId: mail.id,
        userId,
        unsubMailto: unsubscribeMailTo,
        unsubscribeId,
        unsubscribeStrategy: unsubStrategy
      });
    }

    if (output.estimatedSuccess) {
      logger.debug(
        `unsubscriber-service: success, adding ${unsubStrategy} unsubscription to stats`
      );
      addUnsubscriptionToStats({ unsubStrategy });
      if (organisationId) {
        recordUnsubscribeForOrganisation(organisationId);
      } else {
        incrementCreditsUsedForUser(userId);
      }
    } else if (!organisationId) {
      logger.debug(
        `unsubscriber-service: estimated success is false, incrementing user credits by 1`
      );
      incrementUserCredits(userId, 1);
      sendToUser(userId, 'update-credits', 1, { skipBuffer: true });
    }
    addNewUnsubscribeOccrurence(userId, mail.from);
    addUnsubscribeActivityToUser(userId, {
      unsubCount: unsubscriptions.length + 1,
      milestones
    });
    return {
      ...mailData,
      id: output.id,
      estimatedSuccess: output.estimatedSuccess,
      hasImage,
      unsubStrategy,
      unsubscribedAt: Date.now()
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
      fs.mkdirSync(dir, { recursive: true });
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
