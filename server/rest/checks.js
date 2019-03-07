import { getAllStats, getLeaderboardStats } from '../services/stats';

import logger from '../utils/logger';

export default app => {
  // check how many scans are currently running
  app.get('/checks/scans', async (req, res) => {
    try {
      const stats = await getAllStats();
      res.send(stats);
    } catch (err) {
      logger.error(`checks-rest: error checking running scans`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
  // check how many unsubscribes are currently running
  app.get('/checks/unsubscribes', async (req, res) => {
    try {
      const stats = await getLeaderboardStats();
      res.send(stats);
    } catch (err) {
      logger.error(`checks-rest: error checking`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
};
