import Gmail from 'node-gmail-api';
import url from 'url';
import puppeteer from 'puppeteer';
import subDays from 'date-fns/sub_days';
import subWeeks from 'date-fns/sub_weeks';
import subMonths from 'date-fns/sub_months';
import format from 'date-fns/format';

import { getUserById } from './user';

const googleDateFormat = 'YYYY/MM/DD';

export async function scanMail(
  { userId, timeframe },
  { onMail, onError, onEnd }
) {
  try {
    let senders = [];
    const now = new Date();
    let then;
    const [value, unit] = timeframe;
    if (unit === 'd') {
      then = subDays(now, value);
    } else if (unit === 'w') {
      then = subWeeks(now, value);
    } else if (unit === 'm') {
      then = subMonths(now, value);
    }

    const user = await getUserById(userId);
    const gmail = new Gmail(user.keys.accessToken);

    const limit = 10;
    const searchStr = getSearchString({ then, now });
    console.log('doing scan... ', userId, timeframe, searchStr);
    const s = gmail.messages(searchStr, {
      timeout: 10000,
      max: 10000
    });

    s.on('data', m => {
      console.log('mail');
      if (isUnsubscribable(m)) {
        const mail = mapMail(m);
        // don't send duplicates
        if (mail && !senders.includes(mail.from)) {
          senders = [...senders, mail.from];
          onMail(mail);
        }
      }
    });

    s.on('end', () => {
      console.log('end mail');
      onEnd();
    });

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
  const { unsubscribeLink } = mail;
  console.log('unsubscribe from', mail);
  return unsubscribe(unsubscribeLink);
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

    if (/^<.+>,\s*<.+>$/.test(unsub)) {
      const unsubTypes = unsub
        .split(',')
        .map(a => a.trim().match(/^<(.*)>$/)[1]);
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
    console.error(err);
    return null;
  }
}

const unsubSuccessKeywords = ['successfully', 'success'];

function getSearchString({ then, now }) {
  const thenStr = format(then, googleDateFormat);
  const nowStr = format(now, googleDateFormat);
  return `after:${thenStr} and before:${nowStr}`;
}
async function unsubscribe(unsubUrl) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(unsubUrl, { waitUntil: 'networkidle2' });
  const bodyText = await page.evaluate(() => document.body.innerText);
  const image = await page.screenshot({
    encoding: 'base64'
  });
  const hasSuccessKeywords = unsubSuccessKeywords.some(word => {
    return bodyText.includes(word);
  });

  await browser.close();
  return { estimatedSuccess: hasSuccessKeywords, image };
}
