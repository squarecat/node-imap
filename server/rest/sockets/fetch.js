const Sentry = require('@sentry/node');

import { RestError } from '../../utils/errors';
import { fetchMail } from '../../services/mail';
import { get as getSession } from '../../dao/sessions';
import io from '@pm2/io';
import { sendToUser } from './index';

import { createBufferClient } from '../../utils/redis';
import logger from '../../utils/logger';

import { promisify } from 'util';

const runningScans = createBufferClient({
  prefix: 'lma.running_scans_'
});

const scansRunningCounter = io.counter({
  name: 'Scans Running'
});

const exists = promisify(runningScans.exists).bind(runningScans);
const set = promisify(runningScans.set).bind(runningScans);
const del = promisify(runningScans.del).bind(runningScans);

export default async function fetch(socket, userId, data = {}) {
  const { browserId } = socket;
  const session = await getSession(userId);
  const { masterKey } = session.passport.user;
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
    doFetch({ browserId, userId, accountFilters, prevDupeCache, masterKey })
  );
}

async function doFetch({
  browserId,
  userId,
  accountFilters,
  prevDupeCache,
  masterKey
}) {
  // if scan is already running then ignore this event
  const alreadyRunning = await isScanAlreadyRunning(browserId);
  if (alreadyRunning) {
    logger.debug('[socket]: scan is already running');
    return;
  }

  await setScanRunning(browserId);

  try {
    await onStart({ startedAt: Date.now() }, { userId, browserId });
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
        await onMail(data, { userId, browserId });
      } else if (type === 'progress') {
        await onProgress(data, { userId, browserId });
      }
      next = await it.next();
    }
    await setScanFinished(browserId);
    await onEnd(next.value, { userId, browserId });
  } catch (err) {
    await setScanFinished(browserId);
    // if we haven't already handled this error then throw a rest error
    if (!err.handled) {
      Sentry.captureException(err);
    }
    const error = new RestError('Failed to fetch new mail', {
      userId: userId,
      cause: err,
      ...err.data
    }).toJSON();
    onError(error, { userId, browserId });
  }
}

async function onMail(m, { userId, browserId }) {
  return sendToUser(userId, 'mail', m, { browserId });
}

function onError(err, { userId, browserId }) {
  return sendToUser(userId, 'mail:err', err, { browserId });
}

function onEnd(stats, { userId, browserId }) {
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
  return sendToUser(
    userId,
    'mail:end',
    {
      ...stats,
      occurrences: filteredoccurrences
    },
    { browserId }
  );
}

function onProgress(progress, { userId, browserId }) {
  return sendToUser(userId, 'mail:progress', progress, { browserId });
}

function onStart(data, { userId, browserId }) {
  return sendToUser(userId, 'mail:start', data, { browserId });
}

export function isScanAlreadyRunning(browserId) {
  return exists(browserId);
}

function setScanRunning(browserId) {
  scansRunningCounter.inc();
  return set(
    browserId,
    JSON.stringify({
      startedAt: Date.now()
    }),
    'PX',
    1000 * 60 * 60
  );
}

function setScanFinished(browserId) {
  scansRunningCounter.dec();
  return del(browserId);
}
