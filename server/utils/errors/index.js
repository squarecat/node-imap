import _omit from 'lodash.omit';
import config from 'getconfig';
import isBefore from 'date-fns/is_before';
import logger from '../../../build/utils/logger';
import util from 'util';

export const savedErrors = {};
const isDev =
  process.env.NODE_ENV === 'development' || config.env === 'development';

function genId() {
  return Math.random()
    .toString(10)
    .substring(2, 8);
}

export function LMAError(message, data = {}) {
  Error.captureStackTrace(this, this.constructor);
  this.id = genId();
  this.name = this.constructor.name;
  this.message = message;
  this.data = _omit(data, 'cause');
  this.level = 'error';
  this.cause = data.cause;
  this.toString = function() {
    return `\n${this.name}: ${this.message}`;
  };
  let cause = this.cause;
  let id = this.id;
  if (cause) {
    if (!(cause instanceof LMAError)) {
      const causeId = genId();
      savedErrors[causeId] = {
        id: causeId,
        name: cause.name,
        message: cause.message,
        level: cause.level,
        timestamp: Date.now(),
        stack: cause.stack
      };
      id = `${id}-${causeId}`;
      cause = cause.cause;
    } else {
      id = `${id}-${cause.combinedId}`;
    }
  }
  this.combinedId = id;

  savedErrors[this.id] = {
    id: this.id,
    name: this.name,
    message: this.message,
    level: this.level,
    timestamp: Date.now(),
    stack: this.stack
  };
  this.toJSON = function() {
    let json = {
      id,
      message,
      data: this.data
    };
    if (isDev) {
      json = {
        ...json,
        trace: `/api/errors/${id}`
      };
    }
    logger.error(
      `[error]: ${this.name} - ${this.message} ${
        config.urls.base
      }/api/errors/${id}`
    );
    return json;
  };
}

util.inherits(LMAError, Error);

export function SeriousError(message, data) {
  LMAError.call(this, message, data);
}
util.inherits(SeriousError, LMAError);

export function RestError(message, data) {
  LMAError.call(this, message, data);
}
util.inherits(RestError, LMAError);

export function MailError(message, data) {
  LMAError.call(this, message, data);
}
util.inherits(MailError, LMAError);

export function AuthError(message, data) {
  LMAError.call(this, message, data);
}
util.inherits(AuthError, LMAError);

export function PaymentError(message, data) {
  LMAError.call(this, message, data);
}
util.inherits(RestError, LMAError);

export function UncaughtRestError(message = 'Uncaught error', data) {
  RestError.call(this, message, {
    ...data,
    code: 500
  });
}
util.inherits(UncaughtRestError, RestError);

// clear errors every day
const oneDay = 1000 * 60 * 60 * 24;
setInterval(() => {
  Object.keys(savedErrors).forEach(key => {
    const err = savedErrors[key];
    const { timestamp } = err;
    if (isBefore(timestamp, Date.now() - oneDay)) {
      delete savedErrors[key];
    }
  });
}, oneDay);
