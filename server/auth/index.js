import initGoogle, { Strategy as GoogleStrategy } from './google';
import initOutlook, { Strategy as OutlookStrategy } from './outlook';

import { getUserById } from '../services/user';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

passport.use(GoogleStrategy);
refresh.use(GoogleStrategy);
passport.use(OutlookStrategy);
refresh.use(OutlookStrategy);

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
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
