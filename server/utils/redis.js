import config from 'getconfig';
import redis from 'redis';

const isProd = process.env.NODE_ENV;

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
  return redis.createClient({
    prefix,
    ...redisOptions
  });
}
