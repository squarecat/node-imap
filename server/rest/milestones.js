import auth from '../middleware/route-auth';
import { getMilestones } from '../services/milestones';
import logger from '../utils/logger';

export default app => {
  app.get('/api/milestones/:name?', auth, async (req, res) => {
    const { name } = req.params;
    try {
      const milestones = await getMilestones(name);
      return res.send(milestones);
    } catch (err) {
      logger.error('milestones-rest: error getting milestones');
      logger.error(err);
      return res.status(500).send({
        err: err.toString()
      });
    }
  });
};
