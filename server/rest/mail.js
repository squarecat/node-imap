import {
  addUnsubscribeErrorResponse,
  fetchMail,
  getMailEstimates
} from '../services/mail';

import auth from './auth';
import { checkAuthToken } from '../services/user';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';
import io from '@pm2/io';
import isBefore from 'date-fns/is_before';
import logger from '../utils/logger';
import socketio from 'socket.io';
import subMinutes from 'date-fns/sub_minutes';
import { unsubscribeFromMail } from '../services/unsubscriber';

let connectedClients = {};
let mailBuffer = {};

const mailInBuffer = io.counter({
  name: 'Mail in buffer'
});

const socketsOpen = io.counter({
  name: 'Sockets open'
});

export default function(app, server) {
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

  const io = socketio(server).of('mail');

  // socket auth middleware
  io.use(async (socket, next) => {
    let { userId, token } = socket.handshake.query;
    const isValid = await checkAuthToken(userId, token);
    if (isValid) {
      socket.auth = true;
      socket.userId = userId;
      return next();
    }
    logger.error('mail-rest: socket failed authentication, dropping socket');
    return next(new Error('authentication error'));
  });

  io.on('connection', socket => {
    socketsOpen.inc();
    const { userId } = socket;
    connectedClients[userId] = socket;
    logger.info('mail-rest: socket connected');

    checkBuffer(socket, userId);

    socket.on('reconnect_attempt', () => {
      checkBuffer(socket, userId);
    });

    socket.on('fetch', async ({ timeframe }) => {
      logger.info(`mail-rest: scanning for ${timeframe}`);
      const { onMail, onError, onEnd, onProgress } = getSocketFunctions(
        socket.userId
      );
      try {
        // get mail data for user
        const it = await fetchMail({
          userId: socket.userId,
          timeframe
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
        onError(err);
      }
    });

    socket.on('unsubscribe', async mail => {
      try {
        const data = await unsubscribeFromMail(socket.userId, mail);
        socket.emit('unsubscribe:success', { id: mail.id, data });
      } catch (err) {
        logger.error('mail-rest: error unsubscribing from mail');
        logger.error(err);
        socket.emit('unsubscribe:err', { id: mail.id, err });
      }
    });

    socket.on('unsubscribe-error-response', async data => {
      try {
        const response = await addUnsubscribeErrorResponse(data, socket.userId);
        socket.emit('unsubscribe-error-response:success', {
          id: data.mailId,
          data: response
        });
      } catch (err) {
        logger.error('mail-rest: error adding unsubscribe response');
        logger.error(err);
        socket.emit('unsubscribe-error-response:err', { id: data.mailId, err });
      }
    });

    socket.on('disconnect', () => {
      logger.info('mail-rest: socket disconnected');
      socketsOpen.dec();
      delete connectedClients[socket.userId];
    });
  });
}

function checkBuffer(socket, userId) {
  logger.info('mail-rest: checking buffer');
  // check to see if this user has stuff in the buffer
  if (mailBuffer[userId]) {
    if (mailBuffer[userId].droppedMail.length) {
      socket.emit('mail', mailBuffer[userId].droppedMail);
      mailInBuffer.dec(mailBuffer[userId].droppedMail.length);
      mailBuffer[userId].droppedMail = [];
    }
    if (mailBuffer[userId].droppedEnd) {
      socket.emit('mail:end');
    }
  }
}

function getSocket(userId) {
  return connectedClients[userId];
}

const mailBuffered = io.meter({
  name: 'buffered mail/minute'
});

function getSocketFunctions(userId) {
  mailBuffer[userId] = { start: Date.now(), droppedMail: [] };
  return {
    onMail: async m => {
      const sock = getSocket(userId);
      if (!sock) {
        logger.error('socket: no socket bufferring mail');
        mailBuffered.mark();
        mailBuffer[userId].droppedMail.push(m);
        mailInBuffer.inc(1);
        return false;
      }

      return new Promise(ack => {
        sock.emit('mail', m, () => {
          ack();
        });
      });
    },
    onError: err => {
      const sock = getSocket(userId);
      if (!sock) {
        logger.error('socket: no socket dropped event `error`');
        return false;
      }
      // if in production, just return a regular
      // error message
      if (process.NODE_ENV !== 'production') {
        sock.emit('mail:err', err.stack);
      } else {
        sock.emit('mail:err', err.toString());
      }
      return true;
    },
    onEnd: stats => {
      const sock = getSocket(userId);
      if (!sock) {
        logger.error('socket: no socket dropped event `end`');
        return false;
      }
      mailBuffer[userId].droppedEnd = true;

      const { occurances } = stats;
      const filteredOccurances = Object.keys(occurances).reduce((out, k) => {
        if (occurances[k] > 1) {
          return {
            ...out,
            [k]: occurances[k]
          };
        }
        return out;
      }, {});
      sock.emit('mail:end', { ...stats, occurances: filteredOccurances });
      return true;
    },
    onProgress: async progress => {
      const sock = getSocket(userId);
      if (!sock) {
        return false;
      }
      return new Promise(ack => {
        sock.emit('mail:progress', progress, () => {
          ack();
        });
      });
    }
  };
}

// TODO move this to redis
// delete any mail in the buffer that is older than 60 minutes
setInterval(() => {
  Object.keys(mailBuffer).forEach(userId => {
    const { start } = mailBuffer[userId];
    if (isBefore(start, subMinutes(new Date(), 60))) {
      mailInBuffer.dec(mailBuffer[userId].droppedMail.length);
      delete mailBuffer[userId];
    }
  });
}, 60000);

io.action('mail-buffer:clear', cb => {
  mailBuffer = {};
  mailInBuffer.set(0);
  cb({ success: true });
});
