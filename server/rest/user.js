import auth from './auth';
import { getUserById } from '../services/user';

export default app => {
  app.get('/api/me', auth, async (req, res) => {
    const { id, email, token, beta, unsubscriptions } = await getUserById(
      req.user.id
    );
    res.send({ id, email, token, beta, unsubscriptions });
  });
};
