import config from 'getconfig';
import { getSessionProp } from '../session';
import logger from '../utils/logger';

const adminUsers = config.admins;

const middleware = (req, res, next) => {
  const { user } = req;
  const isApiRequest = req.url.includes('/api');
  const isAuthenticated = isUserAuthenticated(req);
  const isUnauthenticatedApiRequest = !isAuthenticated && isApiRequest;

  if (isUnauthenticatedApiRequest) {
    logger.info(
      `route-auth: access forbidden at ${req.protocol}://${req.hostname}${
        req.url
      }, user not logged in ${user ? user.id : null}`
    );
    return notAuthorized(req, res);
  }
  // this is a regular page request, so redirect the user to
  // the login page
  if (!isAuthenticated) {
    logger.debug(`route-auth: user not authenticated, redirecting to login`);
    return res.redirect('/login');
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
    return notAuthorized(req, res);
  }
  const { user } = req;
  const { email } = user;
  const isAdmin = adminUsers.includes(email);
  if (!isAdmin) {
    logger.info(
      `route-auth: access forbidden at ${req.protocol}://${req.hostname}${
        req.url
      }, user not an admin ${user ? user.id : null}`
    );
    return notAuthorized(req, res);
  }
  return next();
}

function notAuthorized(req, res) {
  return res.status(403).send({
    message: 'Not authorized',
    reason: 'not-authorized'
  });
}

export default middleware;
