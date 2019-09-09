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
    socket.uuid = session.id;
    return next();
  }
  logger.error(
    `[socket]: failed authentication, dropping socket for user ${userId}`
  );
  return next(new Error('authentication error'));
};
