import Imap from '../../../vendor/node-imap';
import { getImapAccessDetails } from '../../imap.js';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import { parseError } from './errors.js';

const connections = io.counter({
  name: 'IMAP Connections'
});

export async function getMailClient(masterKey, account, audit) {
  const { id, email, host, port, tls } = account;
  try {
    audit.append('Decrypting IMAP details');
    const password = await getImapAccessDetails(id, masterKey, audit);
    return connect({ username: email, password, host, port, tls, audit });
  } catch (err) {
    logger.error('imap-access: failed to connect to IMAP');
    logger.error(err);
    throw parseError(err);
  }
}

const uselessLogs = [
  '=> DONE',
  'LOGIN',
  `<= 'IDLE OK IDLE`,
  `<= 'IDLE BAD`,
  `=> 'IDLE IDLE'`,
  `<= '+ idling'`,
  `<= '* BYE'`,
  `OK !!`,
  `CLOSE`
];
function connect({ username, password, host, port, tls = true, audit }) {
  audit.append(
    `Connecting to IMAP host ${host}:${port} with username ${username}${
      tls ? ` using tls` : ''
    }`
  );
  let log = '';
  return new Promise(async (resolve, reject) => {
    const imap = new Imap({
      user: username,
      password,
      host,
      port,
      tls,
      tlsOptions: {
        // ignore certificates if running in dev mode
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      },
      debug: msg => {
        logger.debug(`[imap]: ${msg}`);
        if (uselessLogs.some(log => msg.includes(log))) {
          return;
        }
        log = `${log}\n${msg}`;
      }
    });
    imap.once('ready', () => {
      audit.append(`IMAP connection successful`);
      connections.inc();
      resolve(imap);
    });

    imap.on('error', function(err) {
      audit.append(`IMAP connection failed`);
      console.error(err);
      audit.appendDebug(`IMAP LOG:\n${log}`);
      reject(err);
    });

    imap.once('close', function() {
      connections.dec();
      // audit.appendDebug(`IMAP LOG:\n${log}`);
      audit.append(`IMAP connection closed`);
    });

    imap.connect();
  });
}

export async function testConnection(args, audit) {
  let imap;
  try {
    imap = await connect({
      ...args,
      audit
    });
    return {
      connected: true
    };
  } catch (err) {
    return {
      connected: false,
      error: parseError(err)
    };
  } finally {
    if (imap) {
      imap.end();
    }
  }
}
