import { RestError, savedErrors } from '../utils/errors';

import { adminOnly } from '../middleware/route-auth';
import config from 'getconfig';
import logger from '../utils/logger';

const Sentry = require('@sentry/node');

export default app => {
  app.get('/api/errors/:ids', adminOnly, (req, res, next) => {
    console.log(JSON.stringify(savedErrors, null, 2));
    try {
      const { ids } = req.params;
      if (ids === 'all') {
        return res.send(`<h3>Errors in the last hour</h3>
        <ul>
        ${Object.keys(savedErrors).map(key => {
          const err = savedErrors[key];
          const url = `${config.urls.base}/api/errors/${key}`;
          return `<li><a href="${url}">${new Date(err.timestamp).toString()}: ${
            err.message
          }</a></li>`;
        })}
        </ul>`);
      }
      const idsArr = ids.split('-');
      const out = `<pre>${idsArr
        .map((id, i) => {
          const err = savedErrors[id];
          if (!err) {
            return '(Error Not found)';
          }
          let out = [];
          if (i === 0) {
            out = [...out, `${new Date(err.timestamp).toString()}`];
          }
          const stack = err.stack ? err.stack.trim() : err;
          return [
            ...out,
            `[${err.level ? err.level : 'system'}] ${stack}`
          ].join('\n');
        })
        .join(`\n\n`)}
      </pre>`;

      res.send(out);
    } catch (err) {
      next(new RestError('failed to get error list', { cause: err }));
    }
  });

  // catch all error route
  app.use(expressErrorHandler);
};

function expressErrorHandler(err, req, res, next) {
  const json = err.toJSON ? err.toJSON() : err.stack;

  // if we haven't already handled this error then throw a rest error
  if (!json.data || !json.data.errKey) {
    Sentry.captureException(err);
  }

  if (res.headersSent) {
    return next(json);
  }
  res.status(500);
  res.send({
    internal_code: json.code,
    message: json.message,
    id: json.id,
    reason: json.data ? json.data.errKey : null
  });
}
