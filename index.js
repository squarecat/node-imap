const Sentry = require('@sentry/node');
Sentry.init({
  dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902'
});

let App;
if (process.env.NODE_ENV !== 'development') {
  console.info('starting production api');
  require('@babel/polyfill');
  App = require('./build/index').default;
} else {
  console.info('starting dev api');
  require('@babel/polyfill');
  require('@babel/register');
  App = require('./server/index').default;
}

process.on('uncaughtException', function(error) {
  Sentry.captureException(error);
  process.exit(1);
});

process.on('unhandledRejection', function(error) {
  Sentry.captureException(error);
});

App.start();
