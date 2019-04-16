// import axios from 'axios';
// import logger from './logger';

// const REVOKE_URL = '';

export async function revokeToken() {
  // currently cannot find a way to revoke an outlook token
  return true;
}

// export async function revokeToken(token) {
// try {
//   const url = `${REVOKE_URL}?token=${token}`;
//   await axios.get(url);
//   return true;
// } catch (err) {
//   logger.error('outlook-utils: error revoking token');
//   if (
//     err.response &&
//     err.response.data &&
//     err.response.data.error === 'invalid_token'
//   ) {
//     logger.error('outlook-utils: token already revoked');
//     return true;
//   }
//   logger.error(err);
//   throw err;
// }
// }
