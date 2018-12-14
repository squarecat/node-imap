import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import http from 'http';
import path from 'path';
import nowLogs from 'now-logs';
import config from 'getconfig';

import userApi from './rest/user';
import auth from './auth';
import mailApi from './rest/mail';
import paymentsApi from './rest/payments';
import statsApi from './rest/stats';

const Sentry = require('@sentry/node');

import { recordStats } from './dao/stats';

import { url as mongoUrl, connect as connectDb } from './dao/db';

Sentry.init({
  dsn: 'https://9b4279f65dbd47e09187ed8b1c4f071b@sentry.io/1334902'
});

nowLogs('colinloveslogs');
const app = express();
const server = http.createServer(app);
const MongoStore = connectMongo(session);

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
app.use(express.json());
app.use(express.urlencoded());
app.use(
  session({
    secret: 'colinisafoursidedcatfromspace',
    saveUninitialized: true,
    resave: true,
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

app.get('/sitemap.xml', (req, res) => {
  console.log('sitemap');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});
app.get('/api', (req, res) => res.send('OK'));
app.get('/roadmap', (req, res) => res.redirect(config.urls.roadmap));

app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.redirect(302, '/404');
});

const App = {
  async start() {
    console.log('server starting');
    await connectDb();
    server.listen(2345);
    await recordStats();
    console.log('server started');
  }
};
export default App;
