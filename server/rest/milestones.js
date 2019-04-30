import { getMilestones, setMilestoneCompleted } from '../services/milestones';

import auth from '../middleware/route-auth';
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
  app.put('/api/milestones/:name/complete', auth, async (req, res) => {
    const { name } = req.params;
    const { user } = req;
    try {
      const reward = await setMilestoneCompleted(name, user);
      return res.send({ reward });
    } catch (err) {
      logger.error('milestones-rest: error getting milestones');
      logger.error(err);
      return res.status(500).send({
        err: err.toString()
      });
    }
  });
};
