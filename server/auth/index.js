import initGoogle, {
  ConnectAccountStrategy as GoogleConnectAccountStrategy,
  Strategy as GoogleStrategy
} from './google';
import initOutlook, {
  ConnectAccountStrategy as OutlookConnectAccountStrategy,
  Strategy as OutlookStrategy
} from './outlook';
import initPassword, { Strategy as PasswordStrategy } from './password';

import { destroySession } from '../session';
import { get as getSession } from '../dao/sessions';
import { getUserById } from '../services/user';
import initTotp from './totp';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';
import v4 from 'uuid/v4';

passport.use('google-login', GoogleStrategy);
refresh.use('google-login', GoogleStrategy);
passport.use('outlook-login', OutlookStrategy);
refresh.use('outlook-login', OutlookStrategy);
passport.use(PasswordStrategy);

passport.use('connect-account-google', GoogleConnectAccountStrategy);
refresh.use('connect-account-google', GoogleConnectAccountStrategy);
passport.use('connect-account-outlook', OutlookConnectAccountStrategy);
refresh.use('connect-account-outlook', OutlookConnectAccountStrategy);

// - master key is only ever stored in the
//   users session so we need to serialize and
//   deserialize it here
// - a token is created for each user in order
//   to validate socket connections can only come
//   from that user
passport.serializeUser(async (user, cb) => {
  // if a session exists then use the same
  // token as that one to avoid lookup issues
  const session = await getSession(user.id);
  let token;
  if (session) {
    token = session.passport.user.token;
  } else {
    // or create a unique session token for socket authentication
    token = v4();
  }
  cb(null, { id: user.id, masterKey: user.masterKey, token });
});

passport.deserializeUser(async function({ id, masterKey, token }, cb) {
  try {
    const user = await getUserById(id);
    cb(null, { ...user, masterKey, token });
  } catch (err) {
    logger.error('auth: failed to deserialize user');
    logger.error(err, null);
    cb(err);
  }
});

export default app => {
  app.use(passport.initialize());
  app.use(passport.session());
  initGoogle(app);
  initOutlook(app);
  initPassword(app);
  initTotp(app);
  app.get('/auth/logout', (req, res) => {
    req.logout();
    destroySession(req);
    res.redirect('/');
  });
};
