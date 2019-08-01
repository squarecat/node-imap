import Imap from 'imap';
import { getImapAccessDetails } from '../../imap.js';
import io from '@pm2/io';
import logger from '../../../../build/utils/logger';

const connections = io.counter({
  name: 'IMAP Connections'
});

export async function getMailClient(master, account) {
  const { id, username, host, port, tls } = account;

  try {
    const { password } = await getImapAccessDetails(master, id);
    return connect({ username, password, host, port, tls });
  } catch (err) {
    logger.error('imap-access: failed to connect to IMAP');
    logger.errro(err);
  }
}

function connect({ username, password, host, port, tls = true }) {
  return new Promise(async (resolve, reject) => {
    const imap = new Imap({
      user: username,
      password,
      host,
      port,
      tls
    });
    imap.once('ready', () => {
      console.log('imap connected');
      connections.inc();
      resolve(imap);
    });

    imap.once('error', function(err) {
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
    imap.end();
    return {
      connected: true
    };
  } catch (err) {
    imap.end();
    return {
      connected: false,
      error: err
    };
  }
}
