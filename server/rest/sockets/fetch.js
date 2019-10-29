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
  const { browserUuid } = socket;
  const session = await getSession(userId);
  const { masterKey } = session.passport.user;
  let { accounts: accountFilters, occurrences } = data;
  let prevDupeCache = [];
  if (occurrences && occurrences.length) {
    prevDupeCache = occurrences.reduce((out, key) => {
      return {
        ...out,
        [key]: {
          count: 1,
          lastSeen: 1
        }
      };
    }, {});
  }
  if (!accountFilters.length) {
    return;
  }

  return setImmediate(() =>
    doFetch({ browserUuid, userId, accountFilters, prevDupeCache, masterKey })
  );
}

async function doFetch({
  browserUuid,
  userId,
  accountFilters,
  prevDupeCache,
  masterKey
}) {
  // if scan is already running then ignore this event
  const alreadyRunning = await isScanAlreadyRunning(browserUuid);
  if (alreadyRunning) {
    logger.debug('[socket]: scan is already running');
    return;
  }

  await setScanRunning(browserUuid);

  try {
    await onStart({ startedAt: Date.now() }, { userId, browserUuid });
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
        await onMail(data, { userId, browserUuid });
      } else if (type === 'progress') {
        await onProgress(data, { userId, browserUuid });
      }
      next = await it.next();
    }
    await setScanFinished(browserUuid);
    await onEnd(next.value, { userId, browserUuid });
  } catch (err) {
    await setScanFinished(browserUuid);
    // if we haven't already handled this error then throw a rest error
    if (!err.handled) {
      Sentry.captureException(err);
    }
    const error = new RestError('Failed to fetch new mail', {
      userId: userId,
      cause: err,
      ...err.data
    }).toJSON();
    onError(error, { userId, browserUuid });
  }
}

async function onMail(m, { userId, browserUuid }) {
  return sendToUser(userId, 'mail', m, { browserUuid });
}

function onError(err, { userId, browserUuid }) {
  return sendToUser(userId, 'mail:err', err, { browserUuid });
}

function onEnd(stats, { userId, browserUuid }) {
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
    { browserUuid }
  );
}

function onProgress(progress, { userId, browserUuid }) {
  return sendToUser(userId, 'mail:progress', progress, { browserUuid });
}

function onStart(data, { userId, browserUuid }) {
  return sendToUser(userId, 'mail:start', data, { browserUuid });
}

export function isScanAlreadyRunning(browserUuid) {
  return exists(browserUuid);
}

function setScanRunning(browserUuid) {
  scansRunningCounter.inc();
  return set(
    browserUuid,
    JSON.stringify({
      startedAt: Date.now()
    }),
    'PX',
    1000 * 60 * 60
  );
}

function setScanFinished(browserUuid) {
  scansRunningCounter.dec();
  return del(browserUuid);
}
