import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import { google } from 'getconfig';

import { createOrUpdateUserFromGoogle } from './services/user';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly', 'email'];
const CLIENT_ID =
  '229643572503-d51b5c1infuudehgdlg1q0sigjella2h.apps.googleusercontent.com';
const CLIENT_SECRET = '9vNmLaNThnZbXmh5RWSys0_0';

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: google.redirect
    },
    async function(accessToken, refreshToken, profile, done) {
      const user = await createOrUpdateUserFromGoogle(profile, {
        refreshToken,
        accessToken
      });
      done(null, { ...user });
    }
  )
);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

export default app => {
  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/google', passport.authenticate('google', { scope: SCOPES }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/app');
    }
  );
  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });
};
