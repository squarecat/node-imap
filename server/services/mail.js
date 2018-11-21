function getMail({ userId }) {}

function mapMail(mail) {
  return mail
    .filter(m => {
      return m.payload.headers.some(h => h.name === 'List-Unsubscribe');
    })
    .map(m => {
      return {
        from: m.payload.headers.find(h => h.name === 'From'),
        to: m.payload.headers.find(h => h.name === 'To'),
        subject: m.payload.headers.find(h => h.name === 'Subject'),
        unsubscribe: m.payload.headers.find(h => h.name === 'List-Unsubscribe')
      };
    });
}
