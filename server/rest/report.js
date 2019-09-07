import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import { report } from '../services/reporter';

export default app => {
  app.put('/api/report', auth, async (req, res, next) => {
    const { user, body } = req;
    const { id: userId } = user;
    const {
      unsubscribeId,
      from,
      estimatedSuccess,
      unsubscribeStrategy,
      occurrences,
      unsubscribeLink,
      unsubscribeMailTo,
      lastReceived,
      unsubscribedAt,
      to,
      id,
      hasImage
    } = body;
    try {
      await report(user, {
        unsubscribeId,
        from,
        to,
        estimatedSuccess,
        unsubscribeLink,
        unsubscribeMailTo,
        unsubscribeStrategy,
        occurrences,
        lastReceived,
        unsubscribedAt,
        id,
        hasImage
      });
      return res.sendStatus(202);
    } catch (err) {
      console.error(err);
      next(
        new RestError('failed to report mail', {
          userId,
          cause: err
        })
      );
    }
  });
};
