import {
  connectUserGoogleAccount,
  createOrUpdateUserFromGoogle,
  updateUserToken
} from '../services/user';
import { isBetaUser, setRememberMeCookie } from './access';

import { AuthError } from '../utils/errors';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20-without-google-plus';
import { URLSearchParams } from 'url';
import addSeconds from 'date-fns/add_seconds';
import { auth } from 'getconfig';
import logger from '../utils/logger';
import passport from 'passport';
import refresh from 'passport-oauth2-refresh';

const { google } = auth;
logger.info(`google-auth: redirecting to ${google.loginRedirect}`);

export const Strategy = new GoogleStrategy(
  {
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.loginRedirect,
    passReqToCallback: true,
    // This option tells the strategy to use the userinfo endpoint instead
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  async function(req, accessToken, refreshToken, params, profile, done) {
    try {
      const { cookies } = req;
      const { referrer, invite } = cookies;
      const { expires_in } = params;
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

      const user = await createOrUpdateUserFromGoogle(
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
          expires: addSeconds(new Date(), expires_in),
          expiresIn: expires_in
        }
      );
      done(null, { ...user });
    } catch (err) {
      done(
        new AuthError('failed to create or update user from Google', {
          cause: err,
          errKey: err.data.errKey
        })
      );
    }
  }
);

export const ConnectAccountStrategy = new GoogleStrategy(
  {
    clientID: google.clientId,
    clientSecret: google.clientSecret,
    callbackURL: google.connectRedirect,
    passReqToCallback: true,
    // This option tells the strategy to use the userinfo endpoint instead
    userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  async function(req, accessToken, refreshToken, params, profile, done) {
    try {
      const { expires_in } = params;

      const user = await connectUserGoogleAccount(
        req.user.id,
        {
          ...profile,
          email: getEmail(profile),
          profileImg: getProfileImg(profile)
        },
        {
          refreshToken,
          accessToken,
          expires: addSeconds(new Date(), expires_in),
          expiresIn: expires_in
        }
      );
      done(null, { ...user });
    } catch (err) {
      if (err.data && err.data.errKey) {
        done(err);
      } else {
        done(
          new AuthError('failed to connect account from Google', {
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
      'google-login',
      refreshToken,
      async (err, accessToken) => {
        if (err) {
          return reject(
            new AuthError('failed to fetch new Google access token', {
              cause: err
            })
          );
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
          reject(
            new AuthError('failed to update Google access token', {
              cause: err
            })
          );
        }
      }
    );
  });
}

export default app => {
  app.get(
    '/auth/google',
    passport.authenticate('google-login', {
      scope: google.scopes,
      // Prompt the user to select an account.
      // https://developers.google.com/identity/protocols/OAuth2WebServer
      prompt: 'consent', // TODO CHANGE BACK TO select_account before phase-2 deploy
      accessType: 'offline'
    })
  );

  app.get(
    '/auth/google/connect',
    passport.authenticate('connect-account-google', {
      scope: google.scopes,
      // Prompt the user to select an account.
      // https://developers.google.com/identity/protocols/OAuth2WebServer
      prompt: 'consent', // TODO CHANGE BACK TO select_account before phase-2 deploy
      accessType: 'offline'
    })
  );

  app.get('/auth/google/callback*', (req, res, next) => {
    logger.debug('google-auth: /auth/google/callback');
    const params = new URLSearchParams(req.params[0]);
    const query = {
      code: params.get('code'),
      scope: params.get('scope'),
      session_state: params.get('session_state'),
      prompt: params.get('prompt')
    };
    req.query = query;

    return passport.authenticate('google-login', (err, user) => {
      const baseErrUrl = `/login?error=true`;
      if (err) {
        logger.error('google-auth: passport authentication error');
        const { id: errId, data } = err.toJSON();
        const errUrl = `${baseErrUrl}&id=${errId}&errKey=${data.errKey ||
          'unknown'}`;
        return res.redirect(errUrl);
      }

      return req.logIn(user, loginErr => {
        if (loginErr) {
          logger.error('google-auth: login error');
          logger.error(loginErr);
          return res.redirect(baseErrUrl);
        }
        setRememberMeCookie(res, {
          username: user.email,
          provider: 'google'
        });
        return res.redirect('/app');
      });
    })(req, res, next);
  });

  app.get('/auth/google/connect/callback', (req, res, next) => {
    logger.debug('google-auth: /auth/google/connect/callback');
    return passport.authenticate('connect-account-google', err => {
      const baseUrl = `/app/profile/accounts/connected`;
      let errUrl = `${baseUrl}?error=true`;
      if (err) {
        logger.error(
          'google-auth: passport authentication error connecting account'
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
