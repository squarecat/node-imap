import logger from '../utils/logger';

export default app => {
  // check how many scans are currently running
  app.post('/auth/reset/:code', async (req, res) => {
    try {
      // form data
    } catch (err) {
      logger.error(`checks-rest: error checking running scans`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
  // check how many unsubscribes are currently running
  app.get('/auth/verify/:code', async (req, res) => {
    try {
      // verify
      res.redirect('/app');
    } catch (err) {
      logger.error(`checks-rest: error checking`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
};
