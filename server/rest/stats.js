import { getAllStats, getLeaderboardStats } from '../services/stats';
import { getExpenses, getNews } from '../utils/airtable';

import logger from '../utils/logger';

export default app => {
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await getAllStats();
      res.send(stats);
    } catch (err) {
      logger.error(`stats-rest: error getting stats`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
  app.get('/api/stats/leaderboard', async (req, res) => {
    try {
      const stats = await getLeaderboardStats();
      res.send(stats);
    } catch (err) {
      logger.error(`stats-rest: error getting leaderboard`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
  app.get('/api/stats/expenses', async (req, res) => {
    try {
      const stats = await getExpenses();
      res.send(stats);
    } catch (err) {
      logger.error(`stats-rest: error getting expenses`);
      logger.error(err);
      res.status(500).send(err);
    }
  });

  app.get('/api/news', async (req, res) => {
    try {
      const news = await getNews();
      res.send(news);
    } catch (err) {
      logger.error(`stats-rest: error getting news`);
      logger.error(err);
      res.status(500).send(err);
    }
  });
};
