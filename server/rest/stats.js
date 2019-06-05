import { getAllStats, getLeaderboardStats } from '../services/stats';
import { getExpenses, getNews } from '../utils/airtable';

import { RestError } from '../utils/errors';
import logger from '../utils/logger';

export default app => {
  app.get('/api/stats', async (req, res, next) => {
    try {
      const stats = await getAllStats();
      res.send(stats);
    } catch (err) {
      next(new RestError('failed to get stats', { cause: err }));
    }
  });
  app.get('/api/stats/leaderboard', async (req, res, next) => {
    try {
      const stats = await getLeaderboardStats();
      res.send(stats);
    } catch (err) {
      next(new RestError('failed to get leaderboard', { cause: err }));
    }
  });
  app.get('/api/stats/expenses', async (req, res, next) => {
    try {
      const stats = await getExpenses();
      res.send(stats);
    } catch (err) {
      next(new RestError('failed to get expenses', { cause: err }));
    }
  });

  app.get('/api/news', async (req, res, next) => {
    try {
      const news = await getNews();
      res.send(news);
    } catch (err) {
      next(new RestError('failed to get news', { cause: err }));
    }
  });
};
