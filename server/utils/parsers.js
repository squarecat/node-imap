export function parseEmail(str) {
  let fromName;
  let fromEmail;
  if (str.match(/^.*<.*>/)) {
    const [, name, email] = /^(.*)(<.*>)/.exec(str);
    fromName = name;
    fromEmail = email;
  } else {
    fromName = '';
    fromEmail = str.from;
  }
  return { fromName, fromEmail };
}

export function emailStringIsEqual(str1, str2) {
  const { fromEmail } = parseEmail(str1);
  const { fromEmail: fromEmail2 } = parseEmail(str2);
  return fromEmail === fromEmail2;
}
