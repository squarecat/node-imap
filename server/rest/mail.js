import socketio from 'socket.io';

import {
  scanMail,
  unsubscribeMail,
  addUnsubscribeErrorResponse,
  getMailEstimates
} from '../services/mail';
import { checkAuthToken } from '../services/user';

let connectedClients = {};

export default function(app, server) {
  app.get('/api/mail/estimates', async (req, res) => {
    const estimates = await getMailEstimates(req.user.id);
    res.send(estimates);
  });

  const io = socketio(server).of('mail');

  io.on('connection', socket => {
    socket.auth = false;
    socket.on('authenticate', async data => {
      try {
        const { userId, token } = data;
        connectedClients[userId] = socket;
        // check the auth data sent by the client
        const isValid = await checkAuthToken(userId, token);
        if (isValid) {
          socket.auth = true;
          socket.userId = userId;
          socket.emit('authenticated');
        }
      } catch (err) {
        console.error('mail-rest: error authenticating socket');
        console.error(err);
      }
    });

    setTimeout(() => {
      // if the socket didn't authenticate, disconnect it
      if (!socket.auth) {
        console.log('mail-rest: Disconnecting socket ', socket.id);
        socket.disconnect('unauthorized');
      }
    }, 5000);

    socket.on('fetch', ({ timeframe }) => {
      if (!socket.auth) {
        return 'Not authenticated';
      }
      console.log('mail-rest: scanning for ', timeframe);
      // get mail data for user
      scanMail(
        {
          userId: socket.userId,
          timeframe
        },
        {
          onMail: m => {
            socket.emit('mail', m);
          },
          onError: err => {
            socket.emit('mail:err', err);
          },
          onEnd: () => {
            socket.emit('mail:end');
          },
          onProgress: progress => {
            socket.emit('mail:progress', progress);
          }
        }
      );
    });

    socket.on('unsubscribe', async mail => {
      try {
        const data = await unsubscribeMail(socket.userId, mail);
        socket.emit('unsubscribe:success', { id: mail.id, data });
      } catch (err) {
        console.error('mail-rest: error unsubscribing from mail');
        console.error(err);
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
        console.error('mail-rest: error adding unsubscribe response');
        console.error(err);
        socket.emit('unsubscribe-error-response:err', { id: data.mailId, err });
      }
    });

    socket.on('disconnect', () => {
      delete connectedClients[socket.userId];
    });
  });
}
