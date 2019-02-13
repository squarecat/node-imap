import { createOrUpdateUserFromGoogle, updateUserToken } from './services/user';

import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
import addSeconds from 'date-fns/add_seconds';
import { google } from 'getconfig';
import logger from './utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

logger.info(`auth: redirecting to ${google.redirect}`);

const googleStrategy = new GoogleStrategy(
  {
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.redirect,
    passReqToCallback: true
  },
  async function(req, accessToken, refreshToken, params, profile, done) {
    try {
      const { cookies } = req;
      const { referrer } = cookies;
      const { expires_in } = params;
      const user = await createOrUpdateUserFromGoogle(
        { ...profile, referralCode: referrer },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), expires_in),
          expiresIn: expires_in
        }
      );
      done(null, { ...user });
    } catch (err) {
      logger.error('auth: failed to create or update user from Google');
      logger.error(err);
      done(err);
    }
  }
);
passport.use(googleStrategy);
refresh.use(googleStrategy);

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

export default app => {
  app.use(passport.initialize());
  app.use(passport.session());

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: google.scopes,
      prompt: 'consent',
      accessType: 'offline'
    })
  );

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

export function refreshAccessToken(userId, { refreshToken, expiresIn }) {
  return new Promise((resolve, reject) => {
    refresh.requestNewAccessToken(
      'google',
      refreshToken,
      async (err, accessToken) => {
        if (err) {
          logger.error('auth: error requesting new access token');
          logger.error(err);
          return reject(err);
        }
        try {
          await updateUserToken(userId, {
            refreshToken,
            accessToken,
            expires: addSeconds(new Date(), expiresIn),
            expiresIn
          });
          resolve(accessToken);
        } catch (err) {
          logger.error('auth: error updating user refresh token');
          logger.error(err);
          reject(err);
        }
      }
    );
  });
}
