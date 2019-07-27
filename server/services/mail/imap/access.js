import Imap from 'imap';
import { getImapAccessDetails } from '../../imap.js';
import io from '@pm2/io';
import logger from '../../../../build/utils/logger';

const connections = io.counter({
  name: 'IMAP Connections'
});

export async function getMailClient(master, account) {
  const { id, username, host, port, tls } = account;

  return new Promise(async (resolve, reject) => {
    try {
      const { password } = await getImapAccessDetails(master, id);
      const imap = new Imap({
        user: username,
        password,
        host,
        port,
        tls
      });
      imap.once('ready', () => {
        connections.inc();
        resolve(imap);
      });

      imap.once('error', function(err) {
        console.log(err);
      });

      imap.once('end', function() {
        connections.dec();
      });
    } catch (err) {
      logger.error('imap-access: failed to connect to IMAP');
      logger.errro(err);
      reject(err);
    }
  });
}
