export function sendMail(options, transport) {
  debugger;
  return new Promise((resolve, reject) => {
    transport.messages().send(options, err => {
      if (err) {
        console.log('failed to send mail');
        console.log(err);
        return reject(err);
      }
      return resolve(true);
    });
  });
}
