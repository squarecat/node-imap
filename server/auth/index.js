import initGoogle, { Strategy as GoogleStrategy } from './google';
import initOutlook, { Strategy as OutlookStrategy } from './outlook';

import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

passport.use(GoogleStrategy);
refresh.use(GoogleStrategy);
passport.use(OutlookStrategy);
refresh.use(OutlookStrategy);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
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
