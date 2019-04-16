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
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

passport.use('google-login', GoogleStrategy);
refresh.use('google-login', GoogleStrategy);
passport.use('outlook-login', OutlookStrategy);
refresh.use('outlook-login', OutlookStrategy);
passport.use(PasswordStrategy);

passport.use('connect-account-google', GoogleConnectAccountStrategy);
refresh.use('connect-account-google', GoogleConnectAccountStrategy);
passport.use('connect-account-outlook', OutlookConnectAccountStrategy);
refresh.use('connect-account-outlook', OutlookConnectAccountStrategy);

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(async function(id, cb) {
  try {
    const user = await getUserById(id);
    cb(null, user);
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
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
