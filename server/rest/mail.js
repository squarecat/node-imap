import {
  addUnsubscribeErrorResponse,
  fetchMail,
  getMailEstimates
} from '../services/mail';

import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';
import { unsubscribeFromMail } from '../services/unsubscriber';

const Sentry = require('@sentry/node');

export default function(app, socket) {
  app.get('/api/mail/image/:mailId', auth, async (req, res, next) => {
    const { user, params } = req;
    const { mailId } = params;
    const path = `${imageStoragePath}/${user.id}/${mailId}.png`;
    try {
      if (fs.existsSync(path)) {
        return res.sendFile(path);
      }
      return res.sendStatus(404);
    } catch (err) {
      next(
        new RestError('Failed to get mail image', {
          userId: user.id,
          path,
          cause: err
        })
      );
    }
  });

  app.get('/api/mail/estimates', auth, async (req, res) => {
    const estimates = await getMailEstimates(req.user.id);
    res.send(estimates);
  });

  socket.on('fetch', async (userId, data = {}) => {
    const { onMail, onError, onEnd, onProgress } = getSocketFunctions(
      userId,
      socket
    );
    const { from, accountIds } = data;
    try {
      // get mail data for user
      const it = await fetchMail({
        userId,
        from,
        accountIds
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
      Sentry.captureException(err);
      onError(
        new RestError('Failed to fetch new mail', {
          userId: userId,
          cause: err
        }).toJSON()
      );
    }
  });

  socket.on('unsubscribe', async (userId, mail) => {
    try {
      const data = await unsubscribeFromMail(userId, mail);
      return socket.emit(userId, 'unsubscribe:success', { id: mail.id, data });
    } catch (err) {
      let error = err;
      // if we haven't already handled this error then throw a rest error
      if (!err.data && !err.data.errKey) {
        error = new RestError('Failed to unsubscribe from mail', {
          userId: userId,
          mailId: mail.id,
          cause: err
        });
        Sentry.captureException(error);
      }
      return socket.emit(userId, 'unsubscribe:err', {
        id: mail.id,
        err: error.toJSON()
      });
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
      const error = new RestError('Failed to add unsubscribe response', {
        userId: userId,
        mailId: data.mailId,
        cause: err
      });
      Sentry.captureException(error);
      socket.emit(userId, 'unsubscribe-error-response:err', {
        id: data.mailId,
        err: error.toJSON()
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
          onSuccess: () => {
            ack();
          }
        });
      });
    },
    onError: err => {
      socket.emit(userId, 'mail:err', err, { buffer: true });
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
          onSuccess: () => {
            ack();
          }
        });
      });
    }
  };
}
