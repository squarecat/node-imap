import {
  connectUserOutlookAccount,
  createOrUpdateUserFromOutlook,
  updateUserAccountToken
} from '../services/user';
import { isBetaUser, setRememberMeCookie } from './access';

import { AuthError } from '../utils/errors';
import { Strategy as OutlookStrategy } from 'passport-outlook';
import { URLSearchParams } from 'url';
import addSeconds from 'date-fns/add_seconds';
import { auth } from 'getconfig';
import logger from '../utils/logger';
import passport from 'passport';
import { pushSessionProp } from '../session';
import refresh from 'passport-oauth2-refresh';

const { outlook } = auth;
logger.info(`outlook-auth: redirecting to ${outlook.loginRedirect}`);

// https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-implicit-grant-flow
// login: The user should be prompted to reauthenticate.
// select_account:
// The user is prompted to select an account, interrupting single sign on.
// The user may select an existing signed-in account, enter their credentials
// for a remembered account, or choose to use a different account altogether.
const PROMPT_TYPE = 'select_account';

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
      const parsedProfile = await parseProfile(profile);

      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email: parsedProfile.email });
        if (!allowed) {
          const error = new AuthError('user does not have access to the beta', {
            errKey: 'beta'
          });
          return done(error, null);
        }
      }

      const user = await createOrUpdateUserFromOutlook(
        {
          ...parsedProfile,
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
      if (err.handled) {
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

export const ConnectAccountStrategy = new OutlookStrategy(
  {
    clientID: outlook.clientId,
    clientSecret: outlook.clientSecret,
    callbackURL: outlook.connectRedirect,
    passReqToCallback: true
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      if (!req.user) {
        throw AuthError('not authenticated');
      }
      const parsedProfile = await parseProfile(profile);
      const user = await connectUserOutlookAccount(req.user.id, parsedProfile, {
        refreshToken,
        accessToken,
        expires: addSeconds(new Date(), 3600),
        expiresIn: 3600
      });
      done(null, { ...user });
    } catch (err) {
      if (err.handled) {
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

export function refreshAccessToken(
  { userId, account },
  { refreshToken, expiresIn }
) {
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
          await updateUserAccountToken(
            { userId, accountEmail: account.email },
            {
              accessToken,
              expires: addSeconds(new Date(), expiresIn),
              expiresIn
            }
          );
          resolve(accessToken);
        } catch (err) {
          logger.error('outlook-auth: error updating user refresh token');
          logger.error(err);
          reject(
            new AuthError('failed to update Outlook access token', {
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
    '/auth/outlook',
    passport.authenticate('outlook-login', {
      scope: outlook.scopes,
      prompt: 'select_account'
    })
  );

  app.get(
    '/auth/outlook/connect',
    passport.authenticate('connect-account-outlook', {
      scope: outlook.scopes,
      prompt: 'select_account'
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
        logger.error(err);
        const { id: errId, data } = err.toJSON();
        const errUrl = `${baseErrUrl}&id=${errId}&reason=${data.errKey ||
          'unknown'}`;
        return res.redirect(errUrl);
      }

      return req.logIn(user, loginErr => {
        if (loginErr) {
          logger.error('outlook-auth: login error');
          logger.error(loginErr);
          return res.redirect(baseErrUrl);
        }
        pushSessionProp(req, 'authFactors', 'outlook');
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

async function parseProfile(profile) {
  const { id, emails, displayName } = profile;
  return {
    id,
    email: emails.length ? emails[0].value : null,
    profileImg: null, // TODO use the photos API to get the image
    displayName
  };
}
