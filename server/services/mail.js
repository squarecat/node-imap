import Gmail from 'node-gmail-api';
import url from 'url';
import config from 'getconfig';
import puppeteer from 'puppeteer';
import subDays from 'date-fns/sub_days';
import subWeeks from 'date-fns/sub_weeks';
import subMonths from 'date-fns/sub_months';
import format from 'date-fns/format';
import emailAddresses from 'email-addresses';

import { getUserById, addUnsubscriptionToUser } from './user';
import { sendUnsubscribeMail } from '../utils/email';
import {
  addResolvedUnsubscription,
  addUnresolvedUnsubscription
} from '../dao/subscriptions';

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
    const { unsubscriptions } = user;
    const limit = 10;
    const searchStr = getSearchString({ then, now });
    console.log('doing scan... ', userId, timeframe, searchStr);

    const s = gmail.messages(searchStr, {
      timeout: 10000,
      max: 10000
    });

    s.on('data', m => {
      if (isUnsubscribable(m)) {
        const mail = mapMail(m);
        const isUnsubscribed = hasUnsubscribedAlready(mail, unsubscriptions);
        // don't send duplicates
        if (mail && !senders.includes(mail.from)) {
          senders = [...senders, mail.from];
          onMail({ ...mail, subscribed: !isUnsubscribed });
        }
      }
    });

    s.on('end', () => {
      console.log('end mail');
      onEnd();
    });

    s.on('error', err => {
      console.error('gmail error', err);
      onError(err.toString());
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function unsubscribeMail(userId, mail) {
  const { unsubscribeLink, unsubscribeMailTo } = mail;
  console.log('mail-service: unsubscribe from', mail);
  let unsubStrategy;
  let output;
  try {
    if (unsubscribeLink) {
      console.log('mail-service: unsubscribing with link');
      unsubStrategy = 'link';
      output = await unsubscribeWithLink(unsubscribeLink);
    } else {
      console.log('mail-service: unsubscribing with mailto');
      unsubStrategy = 'mailto';
      output = await unsubscribeWithMailTo(unsubscribeMailTo);
    }
    addUnsubscriptionToUser(userId, {
      mail,
      unsubStrategy,
      unsubscribeLink,
      unsubscribeMailTo,
      estimatedSuccess: output.estimatedSuccess
    });
    console.log(output);
    return output;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function addUnsubscribeErrorResponse({
  mailId,
  success,
  from,
  image = null,
  reason = null
}) {
  console.log(
    `mail-service: add unsubscribe error response, success: ${success}`
  );
  const domain = getDomain(from);
  if (success) {
    return addResolvedUnsubscription({ mailId, image, domain });
  }
  return addUnresolvedUnsubscription({ mailId, image, domain, reason });
}

function isUnsubscribable(mail) {
  const { headers } = mail.payload;
  return headers.some(h => h.name === 'List-Unsubscribe');
}

function mapMail(mail) {
  const { payload, id, snippet, internalDate } = mail;
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
      googleDate: internalDate,
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

// get lowercase, uppercase and capitalized versions of all keywords too
const unsubSuccessKeywords = config.unsubscribeKeywords.reduce(
  (words, keyword) => [...words, keyword, keyword.toLowerCase()],
  []
);
const confirmButtonKeywords = ['confirm', 'unsubscribe'];

function getSearchString({ then, now }) {
  const thenStr = format(then, googleDateFormat);
  const nowStr = format(now, googleDateFormat);
  return `after:${thenStr} and before:${nowStr}`;
}
async function unsubscribeWithLink(unsubUrl) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(unsubUrl, { waitUntil: 'domcontentloaded' });

    let hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
    if (!hasSuccessKeywords) {
      // find button to press
      const links = await page.$$('a, input[type=submit], button');
      console.log('links', links.length);
      const $confirmLink = await links.reduce(async (promise, link) => {
        const [value, text] = await Promise.all([
          (await link.getProperty('value')).jsonValue(),
          (await link.getProperty('innerText')).jsonValue()
        ]);
        debugger;
        const hasButtonKeyword = confirmButtonKeywords.some(keyword =>
          `${value} ${text}`.toLowerCase().includes(keyword)
        );
        if (hasButtonKeyword) {
          console.log('found text in btn');
          return link;
        }
        return null;
      }, Promise.resolve());
      if ($confirmLink) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          $confirmLink.click()
        ]);
        console.log('clicked button');
        hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
      }
    }
    const image = await page.screenshot({
      encoding: 'base64'
    });
    return { estimatedSuccess: hasSuccessKeywords, image };
  } catch (err) {
    return { estimatedSuccess: false, err };
  } finally {
    await browser.close();
  }
}

async function hasKeywords(page, keywords) {
  const bodyText = await page.evaluate(() =>
    document.body.innerText.toLowerCase()
  );
  return keywords.some(word => {
    return bodyText.includes(word);
  });
}

async function unsubscribeWithMailTo(unsubMailto) {
  try {
    // const address = unsubMailto.replace('mailto:', '');
    const [mailto, paramsString = ''] = unsubMailto.split('?');
    const toAddress = mailto.replace('mailto:', '');
    const params = paramsString.split('&').reduce((out, p) => {
      var d = p.split('=');
      return { ...out, [d[0]]: d[1] };
    }, {});

    const sent = sendUnsubscribeMail({ toAddress, ...params });
    return { estimatedSuccess: sent };
  } catch (err) {
    return { estimatedSuccess: false };
  }
}

function getDomain(mailFrom) {
  const { domain } = emailAddresses.parseOneAddress(mailFrom);
  console.log(`mail-service: got domain: '${domain}' from ${mailFrom}`);
  return domain;
}

// a mail has been unsubscribed already if the from and to
// are the same as previously
// TODO and the date is prior to the unsubscription event?
function hasUnsubscribedAlready(mail, unsubscriptions) {
  return unsubscriptions.some(u => mail.from === u.from && mail.to === u.to);
}
