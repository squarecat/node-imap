const Sentry = require('@sentry/node');

import { RestError } from '../../utils/errors';
import { fetchMail } from '../../services/mail';
import logger from '../../utils/logger';
import { sendToUser } from './index';

let runningScans = {};

export default async function fetch(socket, userId, data = {}) {
  const { masterKey, uuid } = socket;
  let { accounts: accountFilters, occurrences } = data;
  let prevDupeCache = [];
  if (occurrences && occurrences.length) {
    prevDupeCache = occurrences.reduce((out, oc) => {
      const { count, key, lastSeen } = oc;
      return {
        ...out,
        [key]: {
          count,
          lastSeen
        }
      };
    }, {});
  }
  if (!accountFilters.length) {
    return;
  }

  return setImmediate(() =>
    doFetch({ uuid, userId, accountFilters, prevDupeCache, masterKey })
  );
}

async function doFetch({
  uuid,
  userId,
  accountFilters,
  prevDupeCache,
  masterKey
}) {
  // if scan was run in (in the last 5 minutes?)
  // then ignore this scan event
  if (runningScans[uuid]) {
    logger.debug('[socket]: scan is already running');
    return;
  }
  runningScans = {
    ...runningScans,
    [uuid]: Date.now()
  };
  try {
    // get mail data for user
    const it = await fetchMail({
      userId,
      accountFilters,
      prevDupeCache,
      masterKey
    });
    let next = await it.next();
    while (!next.done) {
      const { value } = next;
      const { type, data } = value;
      if (type === 'mail') {
        await onMail(data, { userId });
      } else if (type === 'progress') {
        await onProgress(data, { userId });
      }
      next = await it.next();
    }
    await onEnd(next.value, { userId });
  } catch (err) {
    Sentry.captureException(err);
    onError(
      new RestError('Failed to fetch new mail', {
        userId: userId,
        cause: err
      }).toJSON(),
      { userId }
    );
  } finally {
    delete runningScans[uuid];
  }
}

async function onMail(m, { userId }) {
  return sendToUser(userId, 'mail', m);
}

function onError(err, { userId }) {
  return sendToUser(userId, 'mail:err', err);
}

function onEnd(stats, { userId }) {
  const { occurrences } = stats;
  const filteredoccurrences = Object.keys(occurrences).reduce((out, k) => {
    if (occurrences[k].count > 1) {
      return {
        ...out,
        [k]: occurrences[k]
      };
    }
    return out;
  }, {});
  return sendToUser(userId, 'mail:end', {
    ...stats,
    occurrences: filteredoccurrences
  });
}

function onProgress(progress, { userId }) {
  return sendToUser(userId, 'mail:progress', progress);
}
