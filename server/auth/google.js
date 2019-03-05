import {
  createOrUpdateUserFromGoogle,
  updateUserToken
} from '../services/user';

import { Strategy as GoogleStrategy } from 'passport-google-oauth20-without-google-plus';
import addSeconds from 'date-fns/add_seconds';
import { auth } from 'getconfig';
import { isBetaUser } from './access';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

const { google } = auth;
logger.info(`google-auth: redirecting to ${google.redirect}`);

export const Strategy = new GoogleStrategy(
  {
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.redirect,
    passReqToCallback: true,
    // This option tells the strategy to use the userinfo endpoint instead
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  async function(req, accessToken, refreshToken, params, profile, done) {
    try {
      const { cookies } = req;
      const { referrer } = cookies;
      const { expires_in } = params;
      const email = getEmail(profile);

      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email });
        if (!allowed) {
          logger.debug('auth: user does not have access to the beta');
          return done({ type: 'beta' }, null);
        }
      }

      const user = await createOrUpdateUserFromGoogle(
        { ...profile, email, referralCode: referrer },
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

export default app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: google.scopes,
      prompt: 'consent',
      accessType: 'offline'
    })
  );

  // app.get(
  //   '/auth/google/callback',
  //   passport.authenticate('google', { failureRedirect: '/login' }),
  //   function(req, res) {
  //     res.redirect('/app');
  //   }
  // );

  app.get('/auth/google/callback', (req, res, next) => {
    return passport.authenticate('google', (err, user) => {
      const baseUrl = `/login?error=true`;
      if (err) {
        let errUrl = baseUrl;
        const { type } = err;
        if (type) errUrl += `&type=${type}`;
        return res.redirect(errUrl);
      }

      return req.logIn(user, loginErr => {
        if (loginErr) {
          logger.error('login error');
          logger.error(loginErr);
          return res.redirect(baseUrl);
        }
        return res.redirect('/app');
      });
    })(req, res, next);
  });
};

function getEmail(profile) {
  const { emails } = profile;
  return emails.length ? emails[0].value : null;
}
