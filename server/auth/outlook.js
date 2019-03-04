import {
  createOrUpdateUserFromOutlook,
  updateUserToken
} from '../services/user';

import { Strategy as OutlookStrategy } from 'passport-outlook';
import addSeconds from 'date-fns/add_seconds';
import { auth } from 'getconfig';
import { isBetaUser } from './access';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

const { outlook } = auth;
logger.info(`outlook-auth: redirecting to ${outlook.redirect}`);

export const Strategy = new OutlookStrategy(
  {
    clientID: outlook.clientId,
    clientSecret: outlook.clientSecret,
    callbackURL: outlook.redirect,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const { cookies } = req;
      const { referrer } = cookies;

      if (process.env.NODE_ENV === 'beta') {
        const { emails } = profile;
        const { value: email } = emails[0];
        const allowed = await isBetaUser({ email });
        if (!allowed) {
          logger.debug('auth: user does not have access to the beta');
          return done({ type: 'beta' }, null);
        }
      }

      const user = await createOrUpdateUserFromOutlook(
        { ...profile, referrer },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), 3600),
          expiresIn: 3600
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
      'windowslive',
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
    '/auth/outlook',
    passport.authenticate('windowslive', {
      scope: outlook.scopes
    })
  );

  app.get(
    '/auth/outlook/callback',
    passport.authenticate('windowslive', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/app');
    }
  );
};
