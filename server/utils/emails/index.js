import logger from '../logger';

export function sendMail(options, transport) {
  return new Promise((resolve, reject) => {
    transport.messages().send(options, err => {
      if (err) {
        logger.error('failed to send mail');
        logger.info(JSON.strinfify(options));
        logger.error(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}
