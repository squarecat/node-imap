import initGoogle, {
  ConnectAccountStrategy as GoogleConnectAccountStrategy,
  Strategy as GoogleStrategy
} from './google';
import initOutlook, {
  ConnectAccountStrategy as OutlookConnectAccountStrategy,
  Strategy as OutlookStrategy
} from './outlook';
import initPassword, { Strategy as PasswordStrategy } from './password';

import { getUserById } from '../services/user';
import initTotp from './totp';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';
import { v4 } from 'node-uuid';

passport.use('google-login', GoogleStrategy);
refresh.use('google-login', GoogleStrategy);
passport.use('outlook-login', OutlookStrategy);
refresh.use('outlook-login', OutlookStrategy);
passport.use(PasswordStrategy);

passport.use('connect-account-google', GoogleConnectAccountStrategy);
refresh.use('connect-account-google', GoogleConnectAccountStrategy);
passport.use('connect-account-outlook', OutlookConnectAccountStrategy);
refresh.use('connect-account-outlook', OutlookConnectAccountStrategy);

// master key is only ever stored in the
// users session so we need to serialize and
// deserialize it here
passport.serializeUser(function(user, cb) {
  // create a unique session token for socket authentication
  const token = v4();
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
    res.redirect('/');
  });
};
