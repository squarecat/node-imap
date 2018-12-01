import auth from './auth';
import { getAllStats } from '../services/stats';

export default app => {
  app.get('/api/stats', auth, async (req, res) => {
    const stats = await getAllStats();
    res.send(stats);
  });
};
