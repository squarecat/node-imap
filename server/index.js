import socketApi, { shutdown as shutdownSockets } from './rest/sockets';

import auth from './auth';
import config from 'getconfig';
import { connect as connectDb } from './dao/db';
import cookieParser from 'cookie-parser';
import errorsApi from './rest/errors';
import express from 'express';
import http from 'http';
import logger from './utils/logger';
import mailApi from './rest/mail';
import mailgunWebhooks from './rest/webhooks/mailgun';
import milestonesApi from './rest/milestones';
import orgApi from './rest/organisation';
import path from 'path';
import paymentsApi from './rest/payments';
import reportApi from './rest/report';
import schedule from './utils/scheduler';
import sentryWebhooks from './rest/webhooks/sentry';
import serveStatic from 'serve-static';
import session from './session';
import statsApi from './rest/stats';
import stripeWebhooks from './rest/webhooks/stripe';
import userApi from './rest/user';

const Sentry = require('@sentry/node');

if (process.env.NODE_ENV !== 'development') {
  logger.info('initialising Sentry');
  Sentry.init({
    dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902'
  });
}

const app = express();
const server = http.createServer(app);

app.set('trust proxy', 1);
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());
app.use(session);

auth(app);

app.get('/api', (req, res) => res.send('OK'));

socketApi(server);
userApi(app);
mailApi(app);
paymentsApi(app);
statsApi(app);
reportApi(app);
// giftsApi(app);
milestonesApi(app);
orgApi(app);

mailgunWebhooks(app);
sentryWebhooks(app);
stripeWebhooks(app);

errorsApi(app);

app.get('/api/*', (req, res) => {
  res.status(404).send({
    error: 404,
    message: 'That API route does not not exist'
  });
});
app.get('/roadmap', (req, res) => res.redirect(config.urls.roadmap));
app.get('/feedback', (req, res) => res.redirect(config.urls.feedback));
app.get('/bugs', (req, res) => res.redirect(config.urls.bugs));
app.get('/join-beta', (req, res) => res.redirect(config.urls.requestBeta));
app.get('/submit-testimonial', (req, res) =>
  res.redirect(config.urls.submitTestimonial)
);
app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

app.get('/r/:code', (req, res) => {
  // make sure only the first referrer gets the gold
  if (!req.cookies.referrer) {
    res.cookie('referrer', req.params.code, { maxAge: 900000 });
  }
  res.redirect('/');
});

app.get('/i/:code', (req, res) => {
  // make sure the latest invite is used
  res.cookie('invite', req.params.code, { maxAge: 900000 });
  res.redirect('/signup');
});

app.use(
  express.static(path.join(__dirname, '../public'), {
    setHeaders: setStaticHeaders
  })
);

app.get('*', (req, res) => {
  res.redirect(302, '/404');
});

const App = {
  async start() {
    logger.info('server starting');
    await connectDb();
    server.listen(2345);
    logger.info('server started');
    // tell pm2 that the server is ready
    // to start receiving requests
    if (process.send) {
      process.send('ready');
      console.log('listening for pm2 msg');
      process.on('message', function(packet) {
        if (packet.type === 'cron') {
          schedule(packet.data.timeframe);
        }
      });
    }
  },
  async stop() {
    logger.info('server stopping');
    await shutdownSockets();
    logger.info('server stopped');
  }
};
export default App;

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', error => {
    Sentry.captureException(error);
  });

  process.on('unhandledRejection', error => {
    Sentry.captureException(error);
  });
}

// index.html: public, max-age=0, must-revalidate1
// page-data:  public, max-age=0, must-revalidate1
// public/static/: public, max-age=31536000, immutable
// js/css: public, max-age=31536000, immutable
// /sw.js public, max-age=0, must-revalidate
function setStaticHeaders(res, path) {
  if (process.env.NODE_ENV === 'development') {
    res.setHeader('Cache-Control', 'public, max-age=0');
    return;
  }
  if (
    serveStatic.mime.lookup(path) === 'text/html' ||
    path.includes('/page-data')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate1');
  } else if (
    /^(text\/css)|(application\/javascript)$/.test(
      serveStatic.mime.lookup(path)
    ) ||
    path.includes('public/static')
  ) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=0');
  }
}
