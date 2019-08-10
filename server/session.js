import connectMongo from 'connect-mongo';
import { http } from 'getconfig';
import { url as mongoUrl } from './dao/db';
import session from 'express-session';

const { secret, collection } = http.session;

const MongoStore = connectMongo(session);

const isProd = process.env.NODE_ENV === 'production';
// details on chosen options here:
//   https://www.npmjs.com/package/express-session
export default session({
  secret,
  saveUninitialized: false,
  resave: true,
  proxy: isProd,
  cookie: {
    httpOnly: true,
    secure: isProd,
    expires: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  unset: 'destroy',
  store: new MongoStore({
    url: mongoUrl,
    collection,
    stringify: false,
    serialize
  })
});

function serialize(session) {
  let obj = {};
  const { cookie, passport } = session;
  obj = {
    cookie: {
      originalMaxAge: cookie.originalMaxAge,
      expires: cookie.expires,
      secure: cookie.secure,
      httpOnly: cookie.httpOnly,
      domain: cookie.domain,
      path: cookie.path,
      sameSite: cookie.sameSite
    }
  };
  if (passport) {
    const { user } = passport;
    obj = {
      ...obj,
      userId: user ? user.id : null,
      passport: {
        user
      }
    };
  }
  return obj;
}
