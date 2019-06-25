import logger from '../../utils/logger';
import { sendMessage } from '../../utils/telegram';

export default app => {
  app.get('/api/webhooks/sentry', async (req, res) => {
    try {
      sendMessage('🚨');
      res.send(200);

      <b>${issue.title}</b>
      sentry.io/organizations/kanbanmail/issues/${issue.id}');
    } catch (err) {
      logger.error(err);
    }
  });
  app.post('/api/webhooks/sentry', async (req, res) => {
    logger.info(JSON.stringify(req.body, null, 2));
    const { body } = req;
    const issue = body.data;
    try {
      sendMessage(
`🚨 New Sentry issue: <code>${issue.shortId}</code>
<b>${issue.title}</b>
sentry.io/organizations/squarecat-0d/issues/${issue.id}
`
);
      res.send(200);
    } catch (err) {
      logger.error(err);
    }
  });
};
