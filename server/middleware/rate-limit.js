import rateLimit from 'express-rate-limit';

export default rateLimit({
  windowMs: 60 * 1000, // 10 minute
  max: 10, // start blocking after 10 requests
  handler: (req, res) => {
    res.locals.ignoreRequest = true;
    console.log(`rate-limit: threshold hit ${req.url}`);
    return res.status(429).send('Limit exceeded');
  }
});
