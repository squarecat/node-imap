import { getConnectedSockets } from './connected';
import { get as getSession } from '../../../dao/sessions';
import logger from '../../../utils/logger';

export default async (socket, next) => {
  let { userId, token } = socket.handshake.query;
  // check if user is currently logged in and that their
  // token is valid with the current session
  const session = await getSession(userId);
  if (session && session.passport.user.token === token) {
    socket.auth = true;
    socket.userId = userId;
    socket.masterKey = session.passport.user.masterKey;
    socket.uuid = session.id;
    return next();
  }
  logger.error(
    `[socket]: failed authentication, dropping socket for user ${userId}`
  );
  return next(new Error('authentication error'));
};

export async function updateMasterKey(userId) {
  const sockets = await getConnectedSockets(userId);
  const session = await getSession(userId);
  logger.info(`[socket]: updating master key on users socket ${userId}`);
  sockets.forEach(socket => {
    socket.masterKey = session.passport.user.masterKey;
  });
  return true;
}
