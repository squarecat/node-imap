import { connect as connectDb, url as mongoUrl } from './dao/db';

import auth from './auth';
import config from 'getconfig';
import connectMongo from 'connect-mongo';
import cookieParser from 'cookie-parser';
import express from 'express';
import giftsApi from './rest/gifts';
import http from 'http';
import logger from './utils/logger';
import mailApi from './rest/mail';
import mailgunWebhooks from './rest/webhooks/mailgun';
import path from 'path';
import paymentsApi from './rest/payments';
import session from 'express-session';
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

userApi(app);
mailApi(app, server);
paymentsApi(app);
statsApi(app);
giftsApi(app);

mailgunWebhooks(app);

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/api', (req, res) => res.send('OK'));
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
  }
};
export default App;

if (process.env.NODE_ENV !== 'development') {
  process.on('uncaughtException', function(error) {
    Sentry.captureException(error);
    process.exit(1);
  });

  process.on('unhandledRejection', function(error) {
    Sentry.captureException(error);
  });
}
