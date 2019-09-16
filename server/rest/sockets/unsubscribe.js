const Sentry = require('@sentry/node');

import { RestError } from '../../utils/errors';
import { addUnsubscribeErrorResponse } from '../../services/mail';
import { unsubscribeFromMail } from '../../services/unsubscriber';

export async function unsubscribe(socket, userId, mail) {
  try {
    const data = await unsubscribeFromMail(userId, mail);
    return socket.emit('unsubscribe:success', { id: mail.id, data });
  } catch (err) {
    let error = err;
    // if we haven't already handled this error then throw a rest error
    if (!err.handled) {
      error = new RestError('Failed to unsubscribe from mail', {
        userId: userId,
        mailId: mail.id,
        cause: err
      });
      Sentry.captureException(error);
    }
    return socket.emit('unsubscribe:err', {
      id: mail.id,
      err: error.toJSON()
    });
  }
}

export async function unsubscribeError(socket, userId, data) {
  try {
    const response = await addUnsubscribeErrorResponse(data, userId);
    socket.emit('unsubscribe-error-response:success', {
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
    socket.emit('unsubscribe-error-response:err', {
      id: data.mailId,
      err: error.toJSON()
    });
  }
}
