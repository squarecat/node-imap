require('source-map-support').install({
  hookRequire: true
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
App.start();

process.on('SIGINT', async () => {
  console.info('SIGINT signal received.');
  try {
    await App.stop();
    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
});
