import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import http from 'http';
import path from 'path';
import config from 'getconfig';
import cookieParser from 'cookie-parser';

import userApi from './rest/user';
import auth from './auth';
import mailApi from './rest/mail';
import paymentsApi from './rest/payments';
import statsApi from './rest/stats';
import giftsApi from './rest/gifts';

import logger, { httpLogger } from './utils/logger';

const Sentry = require('@sentry/node');

import { startScheduler } from './utils/scheduler';

import { url as mongoUrl, connect as connectDb } from './dao/db';

Sentry.init({
  dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902'
});

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

app.use(httpLogger);

auth(app);
userApi(app);
mailApi(app, server);
paymentsApi(app);
statsApi(app);
giftsApi(app);

app.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/api', (req, res) => res.send('OK'));
app.get('/roadmap', (req, res) => res.redirect(config.urls.roadmap));
app.get('/feedback', (req, res) => res.redirect(config.urls.feedback));
app.get('/bugs', (req, res) => res.redirect(config.urls.bugs));

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
