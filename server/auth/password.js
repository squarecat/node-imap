import {
  authenticateUser,
  authenticationRequiresTwoFactor,
  createOrUpdateUserFromPassword,
  resetUserPassword
} from '../services/user';
import { isBetaUser, setRememberMeCookie } from './access';

import Joi from 'joi';
import { Strategy as LocalStrategy } from 'passport-local';
import logger from '../utils/logger';
import passport from 'passport';
import { validateBody } from '../middleware/validation';
import { AuthError } from '../utils/errors';

const createUserParams = {
  username: Joi.string()
    .email()
    .label('Username must be a valid email address')
    .required(),
  password: Joi.string()
    .min(6)
    .required()
    .label('Password must be a minimum of 6 characters'),
  ['password-confirm']: Joi.string()
    .valid(Joi.ref('password'))
    .label('Passwords must match'),
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
          logger.debug('outlook-auth: user does not have access to the beta');
          return done({ type: 'beta' }, null);
        }
      }
      const user = await authenticateUser({ email: username, password });
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
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
        if (err) return handleLoginError(res, err);
        if (!user) {
          const error = new AuthError('User not found or password incorrect', {
            errKey: 'not-found'
          });
          return handleLoginError(res, error);
        }

        req.logIn(user, async err => {
          const twoFactorRequired = await authenticationRequiresTwoFactor(user);
          if (err) return handleLoginError(res, err);
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
      const { cookies } = req;
      const { body: userData, err: validationError } = res.locals;
      const { referrer, invite } = cookies;

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
          inviteCode: invite
        });
        req.logIn(user, err => {
          if (err) return handleLoginError(res, err);
          setRememberMeCookie(res, {
            username: user.email,
            provider: 'password'
          });
          return res.send({ success: true });
        });
      } catch (err) {
        return handleSignupError(res, err);
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
          if (err) return handleLoginError(res, err);
          setRememberMeCookie(res, {
            username: user.email,
            provider: 'password'
          });
          return res.send({ success: true });
        });
      } catch (err) {
        return handleSignupError(res, err);
      }
    }
  );
};

function handleLoginError(res, err) {
  logger.warn('login error');
  logger.warn(err);

  return res.status(400).send({
    error: err,
    success: false
  });
}

function handleSignupError(res, err) {
  return res.status(500).send({
    error: err,
    success: false
  });
}
