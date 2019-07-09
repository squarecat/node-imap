import { urls } from 'getconfig';

const referer = `${urls.base}/.*`;

export const hostValidation = (referrers = [referer]) => (req, res, next) => {
  const { headers } = req;
  const { referer } = headers;
  if (referrers.some(r => new RegExp(r).test(referer))) {
    return next();
  }
  return res.status(403).send('Forbidden');
};

export const internalOnly = hostValidation();
