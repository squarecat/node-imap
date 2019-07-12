export function parseEmail(str = '', { unwrap = false } = {}) {
  if (!str) {
    return {
      fromName: 'Unknown',
      fromEmail: '<unknown>'
    };
  }
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else if (str.match(/<?.*@/)) {
    const [, name] = /<?(.*)@/.exec(str);
    fromName = name || str;
    fromEmail = str;
  } else {
    fromName = str;
    fromEmail = str;
  }
  fromEmail = fromEmail.trim();
  if (unwrap) {
    if (fromEmail.startsWith('<')) {
      fromEmail = fromEmail.substr(1, fromEmail.length);
    }
    if (fromEmail.endsWith('>')) {
      fromEmail = fromEmail.substr(0, fromEmail.length - 1);
    }
  }
  return { fromName, fromEmail };
}

export function getDupeKey(from, to) {
  const { fromEmail } = parseEmail(from);
  const { fromEmail: toEmail } = parseEmail(to);
  return `${fromEmail}-${toEmail}`.toLowerCase();
}
