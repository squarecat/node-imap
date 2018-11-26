import socketio from 'socket.io';

import {
  scanMail,
  unsubscribeMail,
  addUnsubscribeErrorResponse
} from '../services/mail';
import { checkAuthToken } from '../services/user';

let connectedClients = {};

export default function(app, server) {
  const io = socketio(server).of('mail');

  io.on('connection', socket => {
    socket.auth = false;
    socket.on('authenticate', async data => {
      try {
        const { userId, token } = data;
        console.log('auth socket', data);
        connectedClients[userId] = socket;
        // check the auth data sent by the client
        const isValid = await checkAuthToken(userId, token);
        if (isValid) {
          console.log('Authenticated socket ', socket.id);
          socket.auth = true;
          socket.userId = userId;
          socket.emit('authenticated');
        }
      } catch (err) {
        console.error(err);
      }
    });

    setTimeout(() => {
      // if the socket didn't authenticate, disconnect it
      if (!socket.auth) {
        console.log('Disconnecting socket ', socket.id);
        socket.disconnect('unauthorized');
      }
    }, 5000);

    socket.on('fetch', ({ timeframe }) => {
      if (!socket.auth) {
        return 'Not authenticated';
      }
      console.log('scanning for ', timeframe);
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
          }
        }
      );
    });

    socket.on('unsubscribe', async mail => {
      try {
        const data = await unsubscribeMail(mail);
        socket.emit('unsubscribe:success', { id: mail.id, data });
      } catch (err) {
        console.error(err);
        socket.emit('unsubscribe:err', { id: mail.id, err });
      }
    });

    socket.on('unsubscribe-error-response', async data => {
      try {
        const response = await addUnsubscribeErrorResponse(data);
        socket.emit('unsubscribe-error-response:success', {
          id: data.mailId,
          data: response
        });
      } catch (err) {
        console.error(err);
        socket.emit('unsubscribe-error-response:err', { id: data.mailId, err });
      }
    });

    socket.on('disconnect', () => {
      delete connectedClients[socket.userId];
    });
  });
}
