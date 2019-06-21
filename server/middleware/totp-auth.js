import logger from '../utils/logger';
import { verifyUserTotpToken } from '../services/user';

export default async (req, res, next) => {
  const { user, body } = req;
  const token = body ? body.token : null;
  if (token) {
    const verified = await verifyUserTotpToken(user, { token });
    res.locals.secondFactor = verified;
    if (verified) {
      return next();
    }
  }
  logger.info(
    `access forbidden at ${req.protocol}://${req.hostname}${req.baseUrl}, ${
      user ? ` for user ${user.id}` : ' not authed with required two factor'
    }`
  );
  return res.status(403).send({
    message: 'Not authorized'
  });
};
