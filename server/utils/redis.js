import config from 'getconfig';
import logger from './logger';
import redis from 'redis';

const isProd = process.env.NODE_ENV !== 'development';

let bufferOptions = {
  host: config.buffer.host,
  port: config.buffer.port,
  password: config.buffer.password,
  username: config.buffer.username
};

let cacheOptions = {
  host: config.cache.host,
  port: config.cache.port,
  password: config.cache.password,
  username: config.cache.username
};

if (isProd) {
  bufferOptions = {
    ...bufferOptions,
    tls: {
      servername: config.buffer.host
    }
  };
  cacheOptions = {
    ...cacheOptions,
    tls: {
      servername: config.cache.host
    }
  };
}

export function createBufferClient({ prefix }) {
  return createClient({ prefix, bufferOptions });
}

export function createCacheClient({ prefix }) {
  return createClient({ prefix, cacheOptions });
}

function createClient({ prefix, options }) {
  logger.info(`[redis]: creating client ${prefix}`);
  const client = redis.createClient({
    prefix,
    ...options
  });
  client.set('1', '1', err => {
    if (err) {
      return logger.info(`[redis]: failed to connect ${prefix}`);
    }
    logger.info(`[redis]: connected ${prefix}`);
  });
  return client;
}
