import { isBefore, subHours } from 'date-fns';

import { createBufferClient } from '../../../utils/redis';
import logger from '../../../utils/logger';
import { promisify } from 'util';
import { isScanAlreadyRunning } from '../fetch';

const client = createBufferClient({
  prefix: 'lma.event.buffer_'
});

const lpush = promisify(client.lpush).bind(client);
const lrange = promisify(client.lrange).bind(client);
const rpop = promisify(client.rpop).bind(client);
const llen = promisify(client.llen).bind(client);
const hset = promisify(client.hset).bind(client);
const hdel = promisify(client.hdel).bind(client);
const del = promisify(client.del).bind(client);
const hgetall = promisify(client.hgetall).bind(client);

// runs once when client connects, checks the buffer and sets
// a keepalive record in redis
export default async (socket, next) => {
  const { browserUuid } = socket;

  async function sendEvents() {
    const hasEvents = await hasBufferedEvents(browserUuid);
    let isRunning = false;
    let isScan = false;
    if (hasEvents) {
      const events = await getBufferedEvents(browserUuid);
      // is there any scan events buffered?
      isScan = events.some(({ event }) => /^mail/.test(event));
      // is there any end or error events buffered?
      isRunning = await isScanAlreadyRunning(browserUuid);
      // merge the events and emit them together
      socket.emit('buffered', events);
    }
    return { isRunning, isScan };
  }
  // send buffered events if the client requests them
  socket.on('request-buffer', async (data, ack) => {
    const { isRunning, isScan } = await sendEvents();
    // if the buffer has mail events, but it doesn't have
    // an end event then there is a scan running, so we
    // tell the client not to start running another one
    console.log(`[socket]: <= has-events=${isScan}, is-running=${isRunning}`);
    ack && ack(isScan && isRunning);
  });
  // store a lastseen timestamp so we know when we
  // should drop this users buffered packets
  socket.use((packet, next) => {
    const now = Date.now();
    logger.debug(`[socket]: <= ${packet[0]} ${browserUuid}`);
    hset('lastSeen', browserUuid, now);
    next();
  });
  // send any events if the client drops and reconnects
  socket.on('reconnect_attempt', () => sendEvents());
  return next();
};

export function bufferEvents(browserUuid, events) {
  return lpush.apply(client, [
    browserUuid,
    ...events.map(e => JSON.stringify(e))
  ]);
}

export function getNextBufferedEvent(browserUuid) {
  return rpop(browserUuid);
}

export async function getBufferedEvents(browserUuid) {
  const all = await lrange(browserUuid, 0, -1);
  logger.debug(`[socket]: = sending ${all.length} buffered events`);
  await del(browserUuid);
  return all.map(a => JSON.parse(a));
}

export async function hasBufferedEvents(browserUuid) {
  const len = await llen(browserUuid);
  return len > 0;
}

async function dropBufferedEvents(browserUuid) {
  return del(browserUuid);
}

const HOURLY = 60 * 1000;

// if a user has not been seen for over an hour
// and has buffered events then drop them
setInterval(async () => {
  const oneHourAgo = subHours(Date.now(), 1);
  const browserUuid = await hgetall('lastSeen');
  if (browserUuid) {
    Object.keys(browserUuid).forEach(userId => {
      const timestamp = new Date(userId[userId]);
      if (isBefore(timestamp, oneHourAgo)) {
        logger.debug(`[socket]: ${userId} is idle, dropping events`);
        dropBufferedEvents(userId);
        hdel('lastSeen', userId);
      }
    });
  }
}, HOURLY);
