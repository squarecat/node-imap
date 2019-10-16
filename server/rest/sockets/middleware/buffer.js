import { isBefore, subHours } from 'date-fns';

import { createBufferClient } from '../../../utils/redis';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import { promisify } from 'util';

const bufferedEvents = io.counter({
  name: 'Buffered events'
});

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
  const { userId } = socket;

  async function sendEvents() {
    const hasEvents = await hasBufferedEvents(userId);
    let isRunning = false;
    let isScan = false;
    if (hasEvents) {
      const events = await getBufferedEvents(userId);
      isScan = events.some(({ event }) => /^mail/.test(event));
      isRunning = events.some(({ event }) => /[mail:end|mail:err]/.test(event));
      events.forEach(({ event, data }) => {
        socket.emit(event, data);
      });
    }
    return { isRunning, isScan };
  }
  // send buffered events if the client requests them
  socket.on('request-buffer', async (data, ack) => {
    const { isRunning, isScan } = await sendEvents();
    // if the buffer has mail events, but it doesn't have
    // an end event then there is a scan running, so we
    // tell the client not to start running another one
    ack && ack(isScan && isRunning);
  });
  // store a lastseen timestamp so we know when we
  // should drop this users buffered packets
  socket.use((packet, next) => {
    const now = Date.now();
    logger.debug(`[socket]: <= ${packet[0]} ${userId}`);
    hset('lastSeen', userId, now);
    next();
  });
  // send any events if the client drops and reconnects
  socket.on('reconnect_attempt', () => sendEvents());
  return next();
};

export function bufferEvents(userId, events) {
  return lpush.apply(client, [userId, ...events.map(e => JSON.stringify(e))]);
}

export function getNextBufferedEvent(userId) {
  return rpop(userId);
}

export async function getBufferedEvents(userId) {
  const all = await lrange(userId, 0, -1);
  logger.debug(`[socket]: = sending ${all.length} buffered events`);
  await del(userId);
  return all.map(a => JSON.parse(a));
}

export async function hasBufferedEvents(userId) {
  const len = await llen(userId);
  return len > 0;
}

async function dropBufferedEvents(userId) {
  return del(userId);
}

const HOURLY = 60 * 1000;

// if a user has not been seen for over an hour
// and has buffered events then drop them
setInterval(async () => {
  const oneHourAgo = subHours(Date.now(), 1);
  const userIds = await hgetall('lastSeen');
  if (userIds) {
    Object.keys(userIds).forEach(userId => {
      const timestamp = new Date(userId[userId]);
      if (isBefore(timestamp, oneHourAgo)) {
        logger.debug(`[socket]: ${userId} is idle, dropping events`);
        dropBufferedEvents(userId);
        hdel('lastSeen', userId);
      }
    });
  }
}, HOURLY);
