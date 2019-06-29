import logger from '../../utils/logger';
import { sendMessage } from '../../utils/telegram';

export default app => {
  app.get('/api/webhooks/sentry', async (req, res) => {
    try {
      sendMessage('🚨');
      res.send(200);
    } catch (err) {
      logger.error(err);
    }
  });
  app.post('/api/webhooks/sentry', async (req, res) => {
    logger.info(JSON.stringify(req.body, null, 2));
    const { body } = req;
    const { url, environment, metadata } = body;
    try {
      sendMessage(
        `🚨 New Sentry issue on ${environment}: <b>${metadata.type}: ${
          metadata.value
        }</b>
${url}
`
      );
      res.send(200);
    } catch (err) {
      logger.error(err);
    }
  });
};
