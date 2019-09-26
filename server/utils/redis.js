import config from 'getconfig';
import logger from './logger';
import redis from 'redis';

const isProd = process.env.NODE_ENV !== 'development';

let redisOptions = {
  host: config.buffer.host,
  port: config.buffer.port,
  password: config.buffer.password,
  username: config.buffer.username
};

if (isProd) {
  redisOptions = {
    ...redisOptions,
    tls: {
      servername: config.buffer.host
    }
  };
}

export function createClient({ prefix }) {
  logger.info(`redis: creating client ${prefix}`);
  const client = redis.createClient({
    prefix,
    ...redisOptions
  });
  client.set('1', '1', err => {
    if (err) {
      return logger.info(`redis: failed to connect ${prefix}`);
    }
    logger.info(`redis: connected ${prefix}`);
  });
  return client;
}
