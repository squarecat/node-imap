import {
  createOrUpdateUserFromOutlook,
  updateUserToken
} from '../services/user';

import { Strategy as OutlookStrategy } from 'passport-outlook';
import { URLSearchParams } from 'url';
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
    callbackURL: outlook.loginRedirect,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const { cookies } = req;
      const { referrer } = cookies;
      const email = getEmail(profile);

      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email });
        if (!allowed) {
          logger.debug('outlook-auth: user does not have access to the beta');
          return done({ type: 'beta' }, null);
        }
      }

      const user = await createOrUpdateUserFromOutlook(
        { ...profile, email, referralCode: referrer },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), 3600),
          expiresIn: 3600
        }
      );
      done(null, { ...user });
    } catch (err) {
      logger.error(
        'outlook-auth: failed to create or update user from Outlook'
      );
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
          logger.error('outlook-auth: error requesting new access token');
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
          logger.error('outlook-auth: error updating user refresh token');
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

  app.get('/auth/outlook/callback*', (req, res, next) => {
    const params = new URLSearchParams(req.params[0]);
    const query = {
      code: params.get('code')
    };
    req.query = query;

    return passport.authenticate('windowslive', (err, user) => {
      const baseUrl = `/login?error=true`;
      if (err) {
        let errUrl = baseUrl;
        const { type } = err;
        if (type) errUrl += `&type=${type}`;
        logger.error(`outlook-auth: passport authentication error ${type}`);
        logger.error(err);
        return res.redirect(errUrl);
      }

      return req.logIn(user, loginErr => {
        if (loginErr) {
          logger.error('outlook-auth: login error');
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
