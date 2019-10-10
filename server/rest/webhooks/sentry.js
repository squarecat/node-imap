import logger from '../../utils/logger';
import { sendMessage } from '../../utils/telegram';

export default app => {
  app.get('/api/webhooks/sentry', async (req, res) => {
    try {
      sendMessage('🚨');
      res.sendStatus(200);
    } catch (err) {
      logger.error(err);
    }
  });
  app.post('/api/webhooks/sentry', async (req, res) => {
    const { body } = req;
    const { url, message } = body;
    try {
      sendMessage(
        `🚨 New Sentry issue:
${message}
${url}
`
      );
      res.sendStatus(200);
    } catch (err) {
      logger.error(err);
    }
  });
};
