import { verifyUserTotpToken } from '../services/user';

export default app => {
  app.post('/auth/totp', async (req, res) => {
    const { user, body } = req;
    const { token } = body;
    const verified = await verifyUserTotpToken(user, { token });
    if (verified) {
      req.session.secondFactor = true;
      req.session.authFactors = ['totp'];
    }
    return res.send({
      success: verified
    });
  });
};
