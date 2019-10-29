import { AuthError } from '../../../utils/errors';
import { get as getSession } from '../../../dao/sessions';
import logger from '../../../utils/logger';

export default async (socket, next) => {
  let { userId, token, browserUuid } = socket.handshake.query;
  // check if user is currently logged in and that their
  // token is valid with the current session
  const session = await getSession(userId);
  if (session && session.passport.user.token === token) {
    socket.auth = true;
    socket.userId = userId;
    socket.browserUuid = browserUuid; // uuid is based on browser
    return next();
  }
  logger.error(
    `[socket]: failed authentication, dropping socket for user ${userId}`
  );
  return next(
    new AuthError('authentication error', {
      message: 'Not authorized',
      reason: 'not-authorized'
    })
  );
};
