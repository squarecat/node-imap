import { createBufferClient } from '../../../utils/redis';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import { promisify } from 'util';

let socketio;

const client = createBufferClient({
  prefix: 'lma.clients_'
});

const lpush = promisify(client.lpush).bind(client);
const lrem = promisify(client.lrem).bind(client);
const lrange = promisify(client.lrange).bind(client);
const llen = promisify(client.llen).bind(client);
const scan = promisify(client.scan).bind(client);
const del = promisify(client.del).bind(client);

const socketsOpen = io.counter({
  name: 'Sockets Open'
});
/**
 * Saves the socket ID against the User ID into redis
 * so that we can send messages to this specific user
 * outside the scope of a user request.
 *
 * Such as when the number of credits change or we need
 * to update the client on the status of an unsubscribe
 */
export default io => {
  socketio = io;
  // this is only called when a socket is created
  return async (socket, next) => {
    let { userId } = socket;
    await lpush(userId, socket.id);
    logger.info(`[socket]: connect ${socket.id}`);
    socketsOpen.inc();

    socket.on('error', () => {
      logger.info(`[socket]: error ${socket.id}`);
    });

    socket.on('reconnect_attempt', () => {
      logger.info(`[socket]: reconnected ${socket.id}`);
    });

    socket.on('disconnect', async reason => {
      logger.info(`[socket]: disconnect ${socket.id} ${reason}`);
      socketsOpen.dec();
      const exists = await llen(userId);
      if (exists) {
        // remove all instances of this socket id
        logger.debug(
          `[socket]: removing ${exists} instances of socket ${userId} ${socket.id}`
        );
        lrem(userId, 0, socket.id);
      }
    });
    return next();
  };
};

/**
 * Get the socket(s) that are open to a certain
 * user ID.
 *
 * It's possible a user may have multiple sockets
 * open, so we return all of them
 */
export async function getConnectedSockets(userId) {
  const socketIds = await lrange(userId, 0, -1);
  if (!socketio) {
    logger.warn(
      '[sockets]: no socket server running, failed to emit event to user'
    );
    return [];
  }
  return socketIds.map(id => socketio.sockets[id]).filter(a => a);
}

export async function flushConnections() {
  let cursor = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [cur, keys] = await scan(cursor, 'COUNT', '10');
    console.log('clearing socket connections', keys);
    debugger;
    await del(keys);
    if (cur === 0) {
      break;
    }
    cursor = cur;
  }
}
