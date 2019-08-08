import Imap from 'imap';
import { getImapAccessDetails } from '../../imap.js';
import io from '@pm2/io';
import logger from '../../../utils/logger';
import { parseError } from './errors.js';

const connections = io.counter({
  name: 'IMAP Connections'
});

export async function getMailClient(master, account) {
  const { id, email, host, port, tls } = account;
  try {
    const password = await getImapAccessDetails(master, id);
    return connect({ username: email, password, host, port, tls });
  } catch (err) {
    logger.error('imap-access: failed to connect to IMAP');
    logger.error(err);
    throw parseError(err);
  }
}

function connect({ username, password, host, port, tls = true }) {
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
      }
    });
    imap.once('ready', () => {
      console.log('imap connected');
      connections.inc();
      resolve(imap);
    });

    imap.on('error', function(err) {
      console.log('imap error');
      console.error(err);
      reject(err);
    });

    imap.once('end', function() {
      connections.dec();
      console.log('imap closed');
    });

    imap.connect();
  });
}

export async function testConnection(args) {
  let imap;
  try {
    imap = await connect(args);
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
