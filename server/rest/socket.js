import { isAfter, subMinutes } from 'date-fns';

import { get as getSession } from '../dao/sessions';
import io from '@pm2/io';
import logger from '../utils/logger';
import socketio from 'socket.io';

let connectedClients = {};
let buffer = {};

const socketsOpen = io.counter({
  name: 'Sockets open'
});
const bufferedEvents = io.counter({
  name: 'Buffered events'
});
const bufferedEventsMeter = io.meter({
  name: 'buffered events/minute'
});
const sentEventsMeter = io.meter({
  name: 'sent events/minute'
});

/**
 * Usage;
 *
 * Listen to an event from the client
 *
 * socket.on('eventname', (clientId, ...data) => {
 *    // do something
 * });
 *
 * Send a message to the client
 *
 * socket.emit(clientId, 'eventname', data, options);
 *
 * Options;
 *
 * {
 *   buffer: false,      // buffer messages and send next time client connects
 *   onSuccess: () => {} // callback fired when client has successfully received message
 * }
 *
 */
export default function(server) {
  const io = socketio(server).of('mail');
  let handlers = [];
  // socket auth middleware
  io.use(async (socket, next) => {
    let { userId, token } = socket.handshake.query;
    // check if user is currently logged in and that their
    // token is valid with the current session
    const session = await getSession(userId);
    if (session && session.passport.user.token === token) {
      socket.auth = true;
      socket.userId = userId;
      socket.masterKey = session.passport.user.masterKey;
      return next();
    }
    logger.error('mail-rest: socket failed authentication, dropping socket');
    return next(new Error('authentication error'));
  });

  io.on('connection', socket => {
    const { userId } = socket;
    connectedClients[userId] = socket;
    socketsOpen.inc();
    logger.info('socket: socket connected');
    handlers.forEach(({ path, cb }) => {
      socket.on(path, (data, ...args) =>
        cb(userId, data, { masterKey: socket.masterKey, ...args })
      );
    });

    socket.on('disconnect', () => {
      logger.info('socket: socket disconnected');
      socketsOpen.dec();
      delete connectedClients[userId];
    });
    socket.on('reconnect_attempt', () => {
      logger.info('socket: socket reconnected');
      checkBuffer(socket, userId);
    });
    // send buffered events
    checkBuffer(socket, userId);
  });

  return {
    on: (path, fn) => {
      let cb = fn;
      // let options = opts;
      // if (!fn) {
      //   fn = opts;
      //   options = {};
      // }
      handlers.push({ path, cb });
    },
    emit: (userId, event, data, options) =>
      sendToUser(userId, event, data, options)
  };
}

function checkBuffer(socket, userId) {
  if (buffer[userId]) {
    console.log(`socket: sending ${buffer[userId].length} buffered events`);
    buffer[userId].forEach(({ event, data }) => {
      socket.emit(event, data);
    });
  }
}

export function sendToUser(userId, event, data, options = {}) {
  const socket = connectedClients[userId];
  if (socket) {
    sentEventsMeter.mark();
    return socket.emit(event, data, options.onSuccess);
  }
  if (options.buffer) {
    if (!buffer[userId]) {
      buffer[userId] = [];
    }
    bufferedEventsMeter.mark();
    return buffer[userId].push({ event, data, timestamp: Date.now() });
  }
  return false;
}

const HOURLY = 60 * 60 * 1000;
// TODO move this to redis?
// delete any mail in the buffer that is older than 60 minutes
setInterval(() => {
  Object.keys(buffer).forEach(userId => {
    const events = buffer[userId];
    const newEvents = events.filter(({ timestamp }) => {
      return isAfter(timestamp, subMinutes(new Date(), 60));
    });
    if (newEvents.length) {
      buffer[userId] = newEvents;
    } else {
      delete buffer[userId];
    }
    bufferedEvents.dec(events.length - newEvents.length);
  });
}, HOURLY);

io.action('buffer:clear', cb => {
  buffer = {};
  bufferedEvents.set(0);
  cb({ success: true });
});
