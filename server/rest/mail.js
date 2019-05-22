import {
  addUnsubscribeErrorResponse,
  fetchMail,
  getMailEstimates
} from '../services/mail';

import auth from '../middleware/route-auth';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';
import { unsubscribeFromMail } from '../services/unsubscriber';

const Sentry = require('@sentry/node');

export default function(app, socket) {
  app.get('/api/mail/test/:strategy', auth, async (req, res) => {
    const { strategy } = req.params;
    const { user } = req;
    let mail = [];
    let err;
    const start = Date.now();
    try {
      fetchMail(
        { userId: user.id, timeframe: '1m', ignore: true },
        {
          onMail: m => {
            mail = [...mail, ...m];
          },
          onError: e => {
            console.error('onerror', e);
            console.error(e);
            err = e;
          },
          onEnd: () => {
            const took = Date.now() - start;
            res.send(err || { mail, took });
          },
          onProgress: () => {}
        },
        { strategy }
      );
    } catch (err) {
      logger.error('mail-rest: test err', err.message);
      res.send(err.message);
    }
  });

  app.get('/api/mail/image/:mailId', auth, async (req, res) => {
    const { user, params } = req;
    const { mailId } = params;
    try {
      const path = `${imageStoragePath}/${user.id}/${mailId}.png`;
      if (fs.existsSync(path)) {
        return res.sendFile(path);
      }
      return res.sendStatus(404);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  app.get('/api/mail/estimates', auth, async (req, res) => {
    const estimates = await getMailEstimates(req.user.id);
    res.send(estimates);
  });

  socket.on('fetch', async userId => {
    const { onMail, onError, onEnd, onProgress } = getSocketFunctions(
      userId,
      socket
    );
    try {
      // get mail data for user
      const it = await fetchMail({
        userId
      });
      let next = await it.next();
      while (!next.done) {
        const { value } = next;
        const { type, data } = value;
        if (type === 'mail') {
          await onMail(data);
        } else if (type === 'progress') {
          await onProgress(data);
        }
        next = await it.next();
      }
      onEnd(next.value);
    } catch (err) {
      logger.error('mail-rest: error scanning mail');
      logger.error(err);
      Sentry.captureException(err);
      onError(err);
    }
  });

  socket.on('unsubscribe', async (userId, mail) => {
    try {
      const data = await unsubscribeFromMail(userId, mail);
      socket.emit(userId, 'unsubscribe:success', { id: mail.id, data });
    } catch (err) {
      logger.error('mail-rest: error unsubscribing from mail');
      logger.error(err);
      Sentry.captureException(err);
      socket.emit(userId, 'unsubscribe:err', { id: mail.id, err });
    }
  });

  socket.on('unsubscribe-error-response', async (userId, data) => {
    try {
      const response = await addUnsubscribeErrorResponse(data, userId);
      socket.emit(userId, 'unsubscribe-error-response:success', {
        id: data.mailId,
        data: response
      });
    } catch (err) {
      logger.error('mail-rest: error adding unsubscribe response');
      logger.error(err);
      Sentry.captureException(err);
      socket.emit(userId, 'unsubscribe-error-response:err', {
        id: data.mailId,
        err
      });
    }
  });
}

function getSocketFunctions(userId, socket) {
  return {
    onMail: async m => {
      return new Promise(ack => {
        socket.emit(userId, 'mail', m, {
          buffer: true,
          success: () => {
            ack();
          }
        });
      });
    },
    onError: err => {
      // if in production, just return a regular
      // error message
      if (process.NODE_ENV !== 'production') {
        socket.emit(userId, 'mail:err', err.stack, { buffer: true });
      } else {
        socket.emit(userId, 'mail:err', err.toString(), { buffer: true });
      }
      return true;
    },
    onEnd: stats => {
      const { occurrences } = stats;
      const filteredoccurrences = Object.keys(occurrences).reduce((out, k) => {
        if (occurrences[k] > 1) {
          return {
            ...out,
            [k]: occurrences[k]
          };
        }
        return out;
      }, {});
      socket.emit(
        userId,
        'mail:end',
        { ...stats, occurrences: filteredoccurrences },
        { buffer: true }
      );
      return true;
    },
    onProgress: async progress => {
      return new Promise(ack => {
        socket.emit(userId, 'mail:progress', progress, {
          buffer: true,
          success: () => {
            ack();
          }
        });
      });
    }
  };
}
