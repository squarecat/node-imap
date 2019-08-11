import config from 'getconfig';
import { getSessionProp } from '../session';
import logger from '../utils/logger';

const adminUsers = config.admins;

const middleware = (req, res, next) => {
  const { user } = req;
  const isApiRequest = req.baseUrl.includes('/api');
  const isAuthenticated = isUserAuthenticated(req);
  const isUnauthenticatedApiRequest = !isAuthenticated && isApiRequest;

  if (isUnauthenticatedApiRequest) {
    logger.info(
      `route-auth: access forbidden at ${req.protocol}://${req.hostname}${
        req.baseUrl
      }, user not logged in ${user ? user.id : null}`
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

function isUserAuthenticated(req) {
  const { user } = req;
  if (!user) return false;

  // check regular auth
  let isRegularAuth = req.isAuthenticated();

  // check 2fa auth
  const requiresSecondFactor =
    user.password && user.password.totpSecret && !user.password.unverified;
  if (!requiresSecondFactor) {
    return isRegularAuth;
  }
  const isSecondFactorAuthed = getSessionProp(req, 'secondFactor');
  return isRegularAuth && isSecondFactorAuthed;
}

export function adminOnly(req, res, next) {
  if (!isUserAuthenticated) {
    return res.status(403).send({
      message: 'Not authorized'
    });
  }
  const { user } = req;
  const { email } = user;
  const isAdmin = adminUsers.includes(email);
  if (!isAdmin) {
    logger.info(
      `route-auth: access forbidden at ${req.protocol}://${req.hostname}${
        req.baseUrl
      }, user not an admin ${user ? user.id : null}`
    );
    return res.status(403).send({
      message: 'Not authorized'
    });
  }
  return next();
}
export default middleware;
