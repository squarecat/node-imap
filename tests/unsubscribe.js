import Gmail from 'node-gmail-api';
import subMonths from 'date-fns/sub_months';
import format from 'date-fns/format';

const gmail = new Gmail(process.env.GOOGLE_TOKEN);
const googleDateFormat = 'YYYY/MM/DD';

let output = [];

function scan() {
  const s = gmail.messages(getSearchString(), {
    timeout: 10000,
    max: 10000
  });
  s.on('data', onMail);
  s.on('timeout', () => console.error('Socket timeout'));
  s.on('error', console.error);
  s.on('end', () => {
    console.log(JSON.stringify(output));
 })
}

function getSearchString() {
  const then = subMonths(Date.now(), 1);
  const thenStr = format(then, googleDateFormat);
  return `after:${thenStr}`;
}

const onMail = m => {
  if (isUnsubscribable(m)) {
    const mail = parseMail(mail)
    // ignore duplicates
    const isDupe = output.some(
      dupe =>
        emailStringIsEqual(dupe.from, mail.from) &&
        emailStringIsEqual(dupe.to, mail.to)
    );
    if (mail && !hasDupe) {
      output = [...output, mail];
    }
  }
  totalEmailsCount++;
  progress = progress + 1;
  onProgress({ progress, total });
};

// check if the mail had a List-Unsubscribe header
function isUnsubscribable(mail) {
  const { payload } = mail;
  const { headers } = payload;
  return headers.some(h => h.name === 'List-Unsubscribe');
}

function parseMail(mail) {
  const { payload, id, snippet, internalDate, labelIds } = mail;
  const unsub = payload.headers.find(h => h.name === 'List-Unsubscribe').value;
  const { unsubscribeMailTo, unsubscribeLink } = getUnsubValues(unsub);
  if (!unsubscribeMailTo && !unsubscribeLink) {
    return null;
  }
  return {
    id,
    snippet,
    date: internalDate,
    from: getHeaderValue(payload.headers, 'From'),
    to: getHeaderValue(payload.headers, 'To'),
    subject: getHeaderValue(payload.headers, 'Subject'),
    unsubscribeLink,
    unsubscribeMailTo
  };
}

function getHeaderValue(headers, name) {
  return headers.find(h => h.name === name).value,
}

function getUnsubValues(unsub) {
  let unsubscribeMailTo = null;
  let unsubscribeLink = null;
  if (/^<.+>,\s*<.+>$/.test(unsub)) {
    const unsubTypes = unsub.split(',').map(a => a.trim().match(/^<(.*)>$/)[1]);
    unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
    unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
  } else if (/^<.+>,\s*.+$/.test(unsub)) {
    const unsubTypes = unsub.split(',').map(a => getUnsubValue(a));
    unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
    unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
  } else if (unsub.startsWith('<http')) {
    unsubscribeLink = unsub.substr(1, unsub.length - 2);
  } else if (unsub.startsWith('<mailto')) {
    unsubscribeMailTo = unsub.substr(1, unsub.length - 2);
  } else if (url.parse(unsub).protocol === 'mailto') {
    unsubscribeMailTo = unsub;
  } else if (url.parse(unsub).protocol !== null) {
    unsubscribeLink = unsub;
  }
  return { unsubscribeMailTo, unsubscribeLink };
}

