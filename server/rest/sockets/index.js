import bufferMiddleware, { bufferEvents } from './middleware/buffer';
import connectedUsersMiddleware, {
  flushConnections,
  getConnectedSockets
} from './middleware/connected';
import {
  fetchUnreadNotifications,
  setNotificationsRead
} from './notifications';
import occurrences, { getScores } from './occurrences';
import { unsubscribe, unsubscribeError } from './unsubscribe';

import authMiddleware from './middleware/auth';
import fetch from './fetch';
import logger from '../../utils/logger';
import socketio from 'socket.io';

let io;

export default function(server) {
  logger.info('socket: constructing sockets');
  io = socketio(server).of('mail');

  io.use(authMiddleware);
  io.use(connectedUsersMiddleware(io));
  io.use(bufferMiddleware);

  io.on('connection', socket => {
    logger.info('socket: connection');
    const { userId } = socket;
    const onFetch = fetch.bind(this, socket, userId);
    const onUnsubscribe = unsubscribe.bind(this, socket, userId);
    const onUnsubError = unsubscribeError.bind(this, socket, userId);
    const onGetScores = getScores.bind(this, socket, userId);
    const onOccurrences = occurrences.bind(this, socket, userId);
    const onFetchNotificationsUnread = fetchUnreadNotifications.bind(
      this,
      socket,
      userId
    );
    const onSetNotificationsRead = setNotificationsRead.bind(
      this,
      socket,
      userId
    );

    socket.on('fetch', onFetch);
    socket.on('unsubscribe', onUnsubscribe);
    socket.on('unsubscribe-error-response', onUnsubError);
    socket.on('occurrences', onOccurrences);
    socket.on('fetch-scores', onGetScores);
    socket.on('notifications:fetch-unread', onFetchNotificationsUnread);
    socket.on('notifications:set-read', onSetNotificationsRead);
  });
  logger.info('socket: ready');
}

export async function sendToUser(userId, event, data, options = {}) {
  const sockets = await getConnectedSockets(userId);
  if (sockets.length) {
    logger.debug(`[socket]: => ${event} ${userId}`);
    let received = false;
    await Promise.all(
      sockets.map(socket => {
        return new Promise((res, rej) => {
          let timedOut = false;
          const t = setTimeout(async () => {
            // no ack was received after 2 seconds meaning this probably
            // wasn't sent to the client successfully, so buffer it for later
            if (!options.skipBuffer) {
              await bufferEvents(userId, [{ event, data }]);
            }
            timedOut = true;
            res();
          }, 2000);
          socket.emit(event, data, () => {
            received = true;
            if (!timedOut) {
              clearTimeout(t);
              res();
            }
          });
        });
      })
    );
    return received;
  }
  logger.debug(`[socket]: = ${event} ${userId}`);
  if (!options.skipBuffer) {
    await bufferEvents(userId, [{ event, data }]);
  }
  if (options.onSuccess) options.onSuccess();
}

export async function shutdown() {
  try {
    await flushConnections();
  } catch (err) {
    logger.error(err);
  }
}
