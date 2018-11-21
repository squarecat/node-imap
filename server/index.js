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

app.get('/mail', (req, res) => {
  const gmail = new Gmail(storedUser.accessToken);
  const limit = 10;
  const s = gmail.messages('after:2018/10/01 and before:2018/11/01', {
    timeout: 10000,
    max: 10
    // fields: ['id', 'payload']
  });
  let mail = [];
  s.on('data', function(d) {
    console.log('data');
    mail.push(d);
  });
  s.on('end', () => {
    console.log('end');
    res.send(mapMail(mail));
  });
  s.on('error', err => {
    console.log('err');
    console.error(err);
    res.send(err);
  });
});

userApi(app);
auth(app);
mailApi(app, server);

async function start() {
  await connectDb();
  server.listen(2345);
}

start();
