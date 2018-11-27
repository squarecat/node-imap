import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import http from 'http';
import path from 'path';
import nowLogs from 'now-logs';

import userApi from './rest/user';
import auth from './auth';
import mailApi from './rest/mail';
import paymentsApi from './rest/payments';

import { url as mongoUrl, connect as connectDb } from './dao/db';

nowLogs('colinloveslogs');
const app = express();
const server = http.createServer(app);
const MongoStore = connectMongo(session);

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

app.use(express.static(path.join(__dirname, '../public')));

async function start() {
  await connectDb();
  server.listen(2345);
}

start();
