import config from 'getconfig';
import logger from '../utils/logger';

export default (req, res, next) => {
  const { user } = req;

  const isApiRequest = req.baseUrl.includes('/api');
  const isAuthenticated = req.isAuthenticated();
  const isUnauthenticatedApiRequest = !isAuthenticated && isApiRequest;

  if (isUnauthenticatedApiRequest) {
    logger.info(
      `access forbidden at ${req.protocol}://${req.hostname}${req.baseUrl}, ${
        user ? ` for user ${user.id}` : ' not logged in'
      }`
    );
    return res.status(403).send({
      message: 'Not authorized'
    });
  }
  // this is a regular page request, so redirect the user to
  // the login page
  if (!isAuthenticated) {
    return res.redirect(config.urls.login);
  }
  // continue the request chain
  return next();
};
