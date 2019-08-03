import { addUnsubscribeErrorResponse, fetchMail } from '../services/mail';

import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import logger from '../utils/logger';
import { unsubscribeFromMail } from '../services/unsubscriber';
import { updateOccurrencesSeenByUser } from '../services/occurrences';

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

  function getSocketFunctions(userId) {
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
        const filteredoccurrences = Object.keys(occurrences).reduce(
          (out, k) => {
            if (occurrences[k] > 1) {
              return {
                ...out,
                [k]: occurrences[k]
              };
            }
            return out;
          },
          {}
        );
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

  socket.on('fetch', async (userId, data = {}, { masterKey }) => {
    const { onMail, onError, onEnd, onProgress } = getSocketFunctions(userId);
    let { accounts: accountFilters } = data;
    // if we're already running a scan for an account then
    // DO NOT run another one. Client should be waiting on
    // the results of this scan already
    // const alreadyRunning = runningScans.filter(rs =>
    //   accountFilters.some(af => af.id === rs)
    // );
    // accountFilters = accountFilters.filter(af => !runningScans.includes(af.id));
    // runningScans = [...runningScans, ...accountFilters.map(af => af.id)];
    // if (alreadyRunning.length) {
    //   logger.info(
    //     `mail-rest: already running scans for accounts ${alreadyRunning.join()}, not running again`
    //   );
    // }
    if (!accountFilters.length) {
      return;
    }
    try {
      // get mail data for user
      const it = await fetchMail({
        userId,
        accountFilters,
        masterKey
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
      // runningScans = runningScans.filter(rs =>
      //   accountFilters.every(af => af.id !== rs)
      // );
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
      if (!err.data || !err.data.errKey) {
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

  socket.on('occurrences', async (userId, data) => {
    try {
      updateOccurrencesSeenByUser(userId, data);
    } catch (err) {
      const error = new RestError('Failed to add occurrences', {
        userId: userId,
        cause: err
      });
      Sentry.captureException(error);
    }
  });
}
