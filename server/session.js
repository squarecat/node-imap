import _get from 'lodash.get';
import _set from 'lodash.set';
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
  const { cookie, passport, secondFactor, authFactors } = session;
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
      secondFactor,
      authFactors,
      passport: {
        user
      }
    };
  }
  return obj;
}

// push to an array prop in the session
export function pushSessionProp(req, prop, value) {
  let arr = _get(req.session, prop, []);
  if (!arr) arr = [];
  _set(req.session, prop, [...arr, value]);
  return value;
}

// set a value prop on the session
export function setSessionProp(req, prop, value) {
  _set(req.session, prop, value);
  return value;
}

// get a value from the session
export function getSessionProp(req, prop) {
  return _get(req.session, prop);
}

export function hasSessionProp(req, prop) {
  return !!getSessionProp(req, prop);
}

// destroy the session.
// This triggers it to be removed from the store
export function destroySession(req) {
  req.session = null;
}
