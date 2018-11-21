import auth from './auth';

export default app => {
  app.get('/api/me', auth, (req, res) => {
    res.send(req.user || {});
  });
};
