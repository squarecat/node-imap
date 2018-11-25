import express from 'express';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import http from 'http';

import userApi from './rest/user';
import auth from './auth';
import mailApi from './rest/mail';

import { url as mongoUrl, connect as connectDb } from './dao/db';

const app = express();
const server = http.createServer(app);
const MongoStore = connectMongo(session);

app.use(
  session({
    secret: 'secrettexthere',
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

async function start() {
  await connectDb();
  server.listen(2345);
}

start();
