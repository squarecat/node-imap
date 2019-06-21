import { getMilestones, setMilestoneCompleted } from '../services/milestones';

import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';

export default app => {
  app.get('/api/milestones/:name?', auth, async (req, res, next) => {
    const { name } = req.params;
    try {
      const milestones = await getMilestones({ name });
      return res.send(milestones);
    } catch (err) {
      next(
        new RestError('failed to get milestone', {
          milestoneName: name,
          cause: err
        })
      );
    }
  });

  app.get('/api/me/milestones', auth, async (req, res, next) => {
    const { id: userId } = req.user;
    try {
      const milestones = await getMilestones({
        userId,
        showCompleted: true
      });
      return res.send(milestones);
    } catch (err) {
      next(
        new RestError('failed to get completed milestones', {
          cause: err
        })
      );
    }
  });

  app.put('/api/milestones/:name/complete', auth, async (req, res, next) => {
    const { name } = req.params;
    const { user } = req;
    try {
      const reward = await setMilestoneCompleted(name, user);
      return res.send({ reward });
    } catch (err) {
      next(
        new RestError('failed to set users milestone as completed', {
          milestoneName: name,
          userId: user.id,
          cause: err
        })
      );
    }
  });
};
