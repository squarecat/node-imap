export function parseEmail(str = '') {
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else {
    fromName = '';
    fromEmail = str;
  }
  return { fromName, fromEmail };
}

export function getDupeKey(from, to) {
  const { fromEmail } = parseEmail(from);
  const { fromEmail: toEmail } = parseEmail(to);
  return `${fromEmail}-${toEmail}`.toLowerCase();
}
