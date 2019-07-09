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
    const { url, message, event } = body;
    const { environment } = event;
    try {
      sendMessage(
        `🚨 New Sentry issue on ${environment}:
${message}
${url}
`
      );
      res.send(200);
    } catch (err) {
      logger.error(err);
    }
  });
};
