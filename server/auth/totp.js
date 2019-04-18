import {
  authenticateUser,
  createOrUpdateUserFromPassword
} from '../services/user';

import { Strategy as TotpStrategy } from 'passport-totp';
import passport from 'passport';

export const Strategy = new TotpStrategy(function(user, done) {
  TotpKey.findOne({ userId: user.id }, function(err, key) {
    if (err) {
      return done(err);
    }
    return done(null, key.key, key.period);
  });
});

export default app => {
  app.post(
    '/verify-2fa',
    passport.authenticate('totp', { failureRedirect: '/verify-2fa' }),
    function(req, res) {
      req.session.authFactors = ['totp'];
      res.redirect('/');
    }
  );
};
