import { connect as connectDb, url as mongoUrl } from './dao/db';

import auth from './auth';
import config from 'getconfig';
import connectMongo from 'connect-mongo';
import cookieParser from 'cookie-parser';
import errorsApi from './rest/errors';
import express from 'express';
// import giftsApi from './rest/gifts';
import http from 'http';
import logger from './utils/logger';
import mailApi from './rest/mail';
import mailgunWebhooks from './rest/webhooks/mailgun';
import milestonesApi from './rest/milestones';
import notificationsApi from './rest/notifications';
import orgApi from './rest/organisation';
import path from 'path';
import paymentsApi from './rest/payments';
import { refreshScores } from './dao/occurrences';
import scoresApi from './rest/scores';
import session from 'express-session';
import socketApi from './rest/socket';
import { startScheduler } from './utils/scheduler';
import statsApi from './rest/stats';
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
const MongoStore = connectMongo(session);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded());
app.use(
  session({
    secret: 'colinisafoursidedcatfromspace',
    saveUninitialized: true,
    resave: true,
    cookie: {
      _expires: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: new MongoStore({
      url: mongoUrl,
      collection: 'sessions'
    })
  })
);

auth(app);

app.get('/api', (req, res) => res.send('OK'));

const socket = socketApi(server);
userApi(app);
mailApi(app, socket);
scoresApi(app, socket);
notificationsApi(app, socket);
paymentsApi(app);
statsApi(app);
// giftsApi(app);
milestonesApi(app);
orgApi(app);
mailgunWebhooks(app);
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
  res.redirect('/login');
});

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.redirect(302, '/404');
});

const App = {
  async start() {
    logger.info('server starting');
    await connectDb();
    server.listen(2345);
    await startScheduler();
    logger.info('server started');
    // tell pm2 that the server is ready
    // to start receiving requests
    if (process.send) process.send('ready');
    refreshScores();
  },
  async stop() {
    logger.info('server stopping');
    // const runningScans = await getRunningScans();
    // if (runningScans > 0) {
    //   logger.info(`waiting for ${runningScans} scans to finish`);
    //   await runningScans();
    //   logger.info('done');
    // }
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
