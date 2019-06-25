import logger from '../../utils/logger';
import { sendMessage } from '../../utils/telegram';

export default app => {
  app.post('/webhooks/sentry', async (req, res) => {
    logger.info(JSON.stringify(req.body, null, 2));
    try {
      sendMessage('🚨');
      res.send(200);
    } catch (err) {
      logger.error(err);
    }
  });
};
