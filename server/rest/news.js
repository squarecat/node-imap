import { RestError } from '../utils/errors';
import { getNews } from '../utils/airtable';

export default app => {
  app.get('/api/news', async (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=2628000, immutable');
    try {
      const news = await getNews();
      res.send(news);
    } catch (err) {
      next(new RestError('failed to get news', { cause: err }));
    }
  });
};
