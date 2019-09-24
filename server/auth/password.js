import {
  authenticateUser,
  authenticationRequiresTwoFactor,
  createOrUpdateUserFromPassword,
  resetUserPassword
} from '../services/user';
import { getReferrerUrlData, isBetaUser, setRememberMeCookie } from './access';

import { AuthError } from '../utils/errors';
import Joi from 'joi';
import { Strategy as LocalStrategy } from 'passport-local';
import passport from 'passport';
import { pushSessionProp } from '../session';
import { validateBody } from '../middleware/validation';

const createUserParams = {
  username: Joi.string()
    .email()
    .label('Username must be a valid email address')
    .required(),
  password: Joi.string()
    .min(6)
    .required()
    .label('Password must be a minimum of 6 characters'),
  resetCode: Joi.string()
};

export const Strategy = new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      if (process.env.NODE_ENV === 'beta') {
        const allowed = await isBetaUser({ email: username });
        if (!allowed) {
          const error = new AuthError('user does not have access to the beta', {
            errKey: 'beta'
          });
          return done(error, null);
        }
      }
      const user = await authenticateUser({ email: username, password });
      if (!user) {
        return done(null, false);
      }
      const updatedUser = await createOrUpdateUserFromPassword(user);
      return done(null, updatedUser);
    } catch (err) {
      return done(err);
    }
  }
);

export default app => {
  app.post(
    '/auth/login',
    validateBody(createUserParams, {
      passthrough: true
    }),
    (req, res, next) => {
      passport.authenticate('local', (err, user) => {
        if (err) return errorHandler(res, err);
        if (!user) {
          const error = new AuthError('User not found or password incorrect', {
            errKey: 'not-found'
          });
          return errorHandler(res, error);
        }

        req.logIn(user, async err => {
          pushSessionProp(req, 'authFactors', 'password');
          const twoFactorRequired = await authenticationRequiresTwoFactor(user);
          if (err) return errorHandler(res, err);
          setRememberMeCookie(res, {
            username: user.email,
            provider: 'password'
          });
          return res.send({ success: true, twoFactorRequired });
        });
      })(req, res, next);
    }
  );

  app.post(
    '/auth/signup',
    validateBody(createUserParams, {
      passthrough: true
    }),
    async (req, res) => {
      const { cookies, query } = req;
      const { body: userData, err: validationError } = res.locals;
      const { referrer, invite } = cookies;
      const referralData = getReferrerUrlData(req);

      try {
        if (validationError) {
          return res.status(400).send({
            message: validationError.message,
            success: false
          });
        }
        const { username, password } = userData;

        const user = await createOrUpdateUserFromPassword({
          email: username,
          password,
          referralCode: referrer,
          inviteCode: invite,
          enableTeam: !!query.teams,
          referrer: referralData
        });
        req.logIn(user, err => {
          if (err) return errorHandler(res, err);
          setRememberMeCookie(res, {
            username: user.email,
            provider: 'password'
          });
          return res.send({ success: true });
        });
      } catch (err) {
        return errorHandler(res, err);
      }
    }
  );

  app.post(
    '/auth/reset',
    validateBody(createUserParams, {
      passthrough: true
    }),
    async (req, res) => {
      const { body: userData, err: validationError } = res.locals;

      try {
        if (validationError) {
          return res.status(400).send({
            message: validationError.message,
            success: false
          });
        }
        const { username, password, resetCode } = userData;
        const user = await resetUserPassword({
          email: username,
          password,
          resetCode
        });
        req.logIn(user, err => {
          if (err) return errorHandler(res, err);
          setRememberMeCookie(res, {
            username: user.email,
            provider: 'password'
          });
          return res.send({ success: true });
        });
      } catch (err) {
        return errorHandler(res, err);
      }
    }
  );
};

// the same response as expressErrorHandler
function errorHandler(res, err) {
  const json = err.toJSON ? err.toJSON() : err.stack;

  return res.status(400).send({
    error: {
      internal_code: json.code,
      message: json.message,
      id: json.id,
      reason: json.data ? json.data.errKey : null
    },
    success: false
  });
}
