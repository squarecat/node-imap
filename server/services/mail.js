import Gmail from 'node-gmail-api';
const url from "url";
import { getUserById } from './user';

export async function scanMail({ userId }, { onMail, onError, onEnd }) {
  let mailUnsubLinks = [];
  try {
    const user = await getUserById(userId);
    const gmail = new Gmail(user.keys.accessToken);

    const limit = 10;

    const s = gmail.messages('after:2018/10/01 and before:2018/12/01', {
      timeout: 10000,
      max: 10000
      // fields: ['id', 'payload']
    });

    s.on('data', m => {
      if (isUnsubscribable(m)) {
        const mail = mapMail(m);
        // don't send duplicates
        if (!mailUnsubLinks.includes(mail.unsubscribe)) {
          mailUnsubLinks = [...mailUnsubLinks, mail];
          onMail(mail);
        }
      }
    });

    s.on('end', onEnd);

    s.on('error', err => {
      console.error(err);
      onError(err.toString());
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function unsubscribeMail(mail) {
  const { unsubscribe } = mail;
  console.log('unsubscribe from', mail);
  const unsubUrl = unsubscribe.find(a => a.startsWith('http'));
  return unsubscribe(unsubUrl);
}

function isUnsubscribable(mail) {
  const { headers } = mail.payload;
  return headers.some(h => h.name === 'List-Unsubscribe');
}

function mapMail(mail) {
  const { payload, id, snippet } = mail;
  try {
    const unsub = payload.headers.find(h => h.name === 'List-Unsubscribe')
      .value;
    let unsubscribeMailTo = null;
    let unsubscribeLink = null;

    if (/^<.+>,<.+>$/.test(unsub)) {
      const unsubTypes = unsub
        .split(',')
        .map(a => a.trim().match(/^<(.*)>$/)[1]);
      unsubscribeMailTo = unsubTypes.find(m => m.startsWith('mailto'));
      unsubscribeLink = unsubTypes.find(m => m.startsWith('http'));
    } else if (unsub.startsWith('<http')) {
      unsubscribeLink = unsub.substr(1, a.length - 2);
    } else if (unsub.startsWith('<mailto')) {
      unsubscribeMailTo = unsub.substr(1, a.length - 2);
    } else if (url.parse(unsub).protocol === 'mailto') {
      unsubscribeMailTo = unsub;
    } else if (url.parse(unsub).protocol !== null) {
      unsubscribeLink = unsub;
    }

    if (!unsubscribeMailTo && !unsubscribeLink) {
      return null;
    }
    return {
      id,
      snippet,
      from: payload.headers.find(h => h.name === 'From').value,
      to: payload.headers.find(h => h.name === 'To').value,
      subject: payload.headers.find(h => h.name === 'Subject').value,
      unsubscribeLink,
      unsubscribeMailTo
    };
  } catch (err) {
    console.log(
      'error mapping mail',
      payload.headers.find(h => h.name === 'List-Unsubscribe').value
    );
    return null;
  }
}

async function unsubscribe(unsubUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(unsubUrl, { waitUntil: 'networkidle2' }).waitFor(2000);
  const image = await page.screenshot({
    encoding: 'base64'
  });
  await browser.close();
  return image;
}
