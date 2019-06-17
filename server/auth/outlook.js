import {
  connectUserOutlookAccount,
  createOrUpdateUserFromOutlook,
  updateUserToken
} from '../services/user';
import { isBetaUser, setRememberMeCookie } from './access';

import { AuthError } from '../utils/errors';
import { Strategy as OutlookStrategy } from 'passport-outlook';
import { URLSearchParams } from 'url';
import addSeconds from 'date-fns/add_seconds';
import { auth } from 'getconfig';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

const { outlook } = auth;
logger.info(`outlook-auth: redirecting to ${outlook.loginRedirect}`);

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
      const { referrer, invite } = cookies;
      const email = getEmail(profile);

      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email });
        if (!allowed) {
          const error = new AuthError('user does not have access to the beta', {
            errKey: 'beta'
          });
          return done(error, null);
        }
      }

      const user = await createOrUpdateUserFromOutlook(
        {
          ...profile,
          email,
          profileImg: getProfileImg(profile),
          referralCode: referrer,
          inviteCode: invite
        },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), 3600),
          expiresIn: 3600
        }
      );
      done(null, { ...user });
    } catch (err) {
      done(
        new AuthError('failed to create or update user from Outlook', {
          cause: err,
          errKey: err.data.errKey
        })
      );
    }
  }
);

export const ConnectAccountStrategy = new OutlookStrategy(
  {
    clientID: outlook.clientId,
    clientSecret: outlook.clientSecret,
    callbackURL: outlook.connectRedirect,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = getEmail(profile);
      const user = await connectUserOutlookAccount(
        req.user.id,
        {
          ...profile,
          email,
          profileImg: getProfileImg(profile)
        },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), 3600),
          expiresIn: 3600
        }
      );
      done(null, { ...user });
    } catch (err) {
      if (err.data && err.data.errKey) {
        done(err);
      } else {
        done(
          new AuthError('failed to connect account from Outlook', {
            cause: err
          })
        );
      }
    }
  }
);

export function refreshAccessToken(userId, { refreshToken, expiresIn }) {
  return new Promise((resolve, reject) => {
    refresh.requestNewAccessToken(
      'outlook-login',
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
    passport.authenticate('outlook-login', {
      scope: outlook.scopes
    })
  );

  app.get(
    '/auth/outlook/connect',
    passport.authenticate('connect-account-outlook', {
      scope: outlook.scopes
    })
  );

  app.get('/auth/outlook/callback*', (req, res, next) => {
    const params = new URLSearchParams(req.params[0]);
    const query = {
      code: params.get('code')
    };
    req.query = query;

    return passport.authenticate('outlook-login', (err, user) => {
      const baseErrUrl = `/login?error=true`;
      if (err) {
        logger.error('outlook-auth: passport authentication error');
        const { id: errId, data } = err.toJSON();
        const errUrl = `${baseErrUrl}&id=${errId}&errKey=${data.errKey ||
          'unknown'}`;
        return res.redirect(errUrl);
      }

      return req.logIn(user, loginErr => {
        if (loginErr) {
          logger.error('outlook-auth: login error');
          logger.error(loginErr);
          return res.redirect(baseErrUrl);
        }
        setRememberMeCookie(res, {
          username: user.email,
          provider: 'outlook'
        });
        return res.redirect('/app');
      });
    })(req, res, next);
  });

  app.get('/auth/outlook/connect/callback', (req, res, next) => {
    logger.debug('outlook-auth: /auth/outlook/connect/callback');
    return passport.authenticate('connect-account-outlook', err => {
      const baseUrl = `/app/profile/accounts/connected`;
      let errUrl = `${baseUrl}?error=true`;
      if (err) {
        logger.error(
          'outlook-auth: passport authentication error connecting account'
        );
        logger.error(err);
        if (err.data && err.data.errKey) {
          errUrl = `${errUrl}&reason=${err.data.errKey}`;
        }
        return res.redirect(errUrl);
      }

      return res.redirect(baseUrl);
    })(req, res, next);
  });
};

function getEmail(profile) {
  const { emails } = profile;
  return emails.length ? emails[0].value : null;
}

function getProfileImg(profile) {
  const { photos = [] } = profile;
  return photos.length ? photos[0].value : null;
}
