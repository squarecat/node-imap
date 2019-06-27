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

// Prompt the user to select an account.
// https://developers.google.com/identity/protocols/OAuth2WebServer
const PROMPT_TYPE = 'select_account';

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

      const parsedProfile = parseProfile(profile);

      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email: parsedProfile.email });
        if (!allowed) {
          const error = new AuthError('user does not have access to the beta', {
            errKey: 'beta'
          });
          return done(error, null);
        }
      }

      const user = await createOrUpdateUserFromGoogle(
        {
          ...parsedProfile,
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
      logger.error('google-auth: error authenticating');
      logger.error(err);
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

      const parsedProfile = parseProfile(profile);
      const user = await connectUserGoogleAccount(req.user.id, parsedProfile, {
        refreshToken,
        accessToken,
        expires: addSeconds(new Date(), expires_in),
        expiresIn: expires_in
      });
      done(null, { ...user });
    } catch (err) {
      logger.error('google-auth: error connecting account');
      logger.error(err);
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
          logger.error('google-auth: error requesting new access token');
          logger.error(err);
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
          logger.error('google-auth: error updating user refresh token');
          logger.error(err);
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
      prompt: PROMPT_TYPE,
      accessType: 'offline'
    })
  );

  app.get(
    '/auth/google/connect',
    passport.authenticate('connect-account-google', {
      scope: google.scopes,
      prompt: PROMPT_TYPE,
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
        const errUrl = `${baseErrUrl}&id=${errId}&reason=${data.errKey ||
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

function parseProfile(profile) {
  const { id, emails, photos = [], displayName } = profile;
  return {
    id,
    email: emails.length ? emails[0].value : null,
    profileImg: photos.length ? photos[0].value : null,
    displayName
  };
}
