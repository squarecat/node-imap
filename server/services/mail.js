import Gmail from 'node-gmail-api';
import url from 'url';
import config from 'getconfig';
import puppeteer from 'puppeteer';
import subDays from 'date-fns/sub_days';
import subWeeks from 'date-fns/sub_weeks';
import subMonths from 'date-fns/sub_months';
import format from 'date-fns/format';
import addDays from 'date-fns/add_days';
import emailAddresses from 'email-addresses';

import { getUserById, addUnsubscriptionToUser, addScanToUser } from './user';
import {
  addUnsubscriptionToStats,
  addFailedUnsubscriptionToStats,
  addScanToStats,
  addNumberofEmailsToStats
} from './stats';

import { sendUnsubscribeMail } from '../utils/email';
import {
  addResolvedUnsubscription,
  addUnresolvedUnsubscription
} from '../dao/subscriptions';

const googleDateFormat = 'YYYY/MM/DD';
const estimateTimeframes = ['3d', '1w'];

export async function getMailEstimates(userId) {
  const user = await getUserById(userId);
  const gmail = new Gmail(user.keys.accessToken);
  const now = new Date();
  let estimates = await Promise.all(
    estimateTimeframes.map(async timeframe => {
      const [value, unit] = timeframe;
      let then;
      if (unit === 'd') {
        then = subDays(now, value);
      } else if (unit === 'w') {
        then = subWeeks(now, value);
      }
      const searchStr = getSearchString({ then, now });
      const total = await getEstimatedEmails(searchStr, gmail);
      return {
        timeframe,
        total
      };
    })
  );
  estimates = [
    ...estimates,
    { timeframe: '1m', total: estimates[1].total * 4 },
    { timeframe: '6m', total: estimates[1].total * 4 * 6 }
  ].map(e => ({ ...e, totalSpam: (e.total * 0.48).toFixed() }));

  return estimates;
}

export async function scanMail(
  { userId, timeframe },
  { onMail, onError, onEnd, onProgress }
) {
  try {
    let senders = [];
    const { then, now } = getTimeRange(timeframe);

    const user = await getUserById(userId);
    const gmail = new Gmail(user.keys.accessToken);
    const { unsubscriptions } = user;
    const searchStr = getSearchString({ then, now });
    let total;
    console.log('mail-service: getting estimate');

    if (timeframe === '1m' || timeframe === '6m') {
      const { then: estimateThen } = getTimeRange('1w');
      const estimatedSearchString = getSearchString({
        then: estimateThen,
        now
      });
      const oneWTotal = await getEstimatedEmails(estimatedSearchString, gmail);
      total = timeframe === '1m' ? oneWTotal * 4 : oneWTotal * 4 * 6;
    } else {
      total = await getEstimatedEmails(searchStr, gmail);
    }
    console.log('mail-service: total', total);
    console.log('mail-service: doing scan... ', userId, timeframe, searchStr);

    const s = gmail.messages(searchStr, {
      timeout: 10000,
      max: 10000
    });

    let totalEmailsCount = 0;
    let totalUnsubscribableEmailsCount = 0;
    let totalPreviouslyUnsubscribedEmails = 0;
    let progress = 0;
    onProgress({ progress, total });

    s.on('data', m => {
      if (isUnsubscribable(m)) {
        const mail = mapMail(m);
        console.log('mail-service: mail date', mail.googleDate);
        const isUnsubscribed = hasUnsubscribedAlready(mail, unsubscriptions);
        // don't send duplicates
        if (mail && !senders.includes(mail.from)) {
          senders = [...senders, mail.from];
          onMail({ ...mail, subscribed: !isUnsubscribed });
          totalUnsubscribableEmailsCount++;
          if (isUnsubscribed) {
            totalPreviouslyUnsubscribedEmails++;
          }
        }
      }
      totalEmailsCount++;
      progress = progress + 1;
      onProgress({ progress, total });
    });

    s.on('end', () => {
      console.log('mail-service: end mail');
      addScanToStats();
      addNumberofEmailsToStats({
        totalEmails: totalEmailsCount,
        totalUnsubscribableEmails: totalUnsubscribableEmailsCount,
        totalPreviouslyUnsubscribedEmails
      });
      addScanToUser(userId, {
        timeframe,
        totalEmails: totalEmailsCount,
        totalUnsubscribableEmails: totalUnsubscribableEmailsCount,
        totalPreviouslyUnsubscribedEmails
      });
      onEnd();
    });

    s.on('error', err => {
      console.error('mail-service: gmail error');
      console.error(err);
      onError(err.toString());
    });
  } catch (err) {
    onError(err.toString());
    throw err;
  }
}

export async function unsubscribeMail(userId, mail) {
  const { unsubscribeLink, unsubscribeMailTo } = mail;
  console.log('mail-service: unsubscribe from', mail.id);
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
      image: output.image,
      unsubStrategy,
      unsubscribeLink,
      unsubscribeMailTo,
      estimatedSuccess: output.estimatedSuccess
    });
    if (output.estimatedSuccess) addUnsubscriptionToStats();
    return {
      ...output,
      unsubStrategy
    };
  } catch (err) {
    console.error('mail-service: error unsubscribing from mail', mail.id);
    console.error(err);
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
    addUnsubscriptionToStats();
    return addResolvedUnsubscription({ mailId, image, domain });
  }
  addFailedUnsubscriptionToStats();
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
    console.error('mail-service: error mapping mail');
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
  const tomorrowStr = format(addDays(now, 1), googleDateFormat);
  return `after:${thenStr} and before:${tomorrowStr}`;
}

async function unsubscribeWithLink(unsubUrl) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(unsubUrl, { waitUntil: 'networkidle0' });

    let hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
    if (!hasSuccessKeywords) {
      // find button to press
      const links = await page.$$('a, input[type=submit], button');
      console.log('mail-service: links', links.length);
      const $confirmLink = await links.reduce(async (promise, link) => {
        const [value, text] = await Promise.all([
          (await link.getProperty('value')).jsonValue(),
          (await link.getProperty('innerText')).jsonValue()
        ]);
        const hasButtonKeyword = confirmButtonKeywords.some(keyword =>
          `${value} ${text}`.toLowerCase().includes(keyword)
        );
        if (hasButtonKeyword) {
          console.log('mail-service: found text in btn');
          return link;
        }
        return null;
      }, Promise.resolve());
      if ($confirmLink) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          $confirmLink.click()
        ]);
        console.log('mail-service: clicked button');
        hasSuccessKeywords = await hasKeywords(page, unsubSuccessKeywords);
      }
    }
    const image = await page.screenshot({
      encoding: 'base64'
    });
    return { estimatedSuccess: hasSuccessKeywords, image };
  } catch (err) {
    console.error(err);
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
    return { estimatedSuccess: !!sent };
  } catch (err) {
    return { estimatedSuccess: false };
  }
}

function getDomain(mailFrom) {
  const { domain } = emailAddresses.parseOneAddress(mailFrom);
  return domain;
}

// a mail has been unsubscribed already if the from and to
// are the same as previously
// TODO and the date is prior to the unsubscription event?
function hasUnsubscribedAlready(mail, unsubscriptions = []) {
  return unsubscriptions.some(u => mail.from === u.from && mail.to === u.to);
}

async function getEstimatedEmails(query, gmail) {
  console.log('mail-service: estimate', query);
  return new Promise((resolve, reject) => {
    gmail.estimatedMessages(
      query,
      {
        max: 1000,
        timeout: 5000
      },
      (err, count) => {
        if (err) {
          return reject(err);
        }
        return resolve(count);
      }
    );
  });
}

function getTimeRange(timeframe) {
  let then;
  const now = Date.now();
  const [value, unit] = timeframe;
  if (unit === 'd') {
    then = subDays(now, value);
  } else if (unit === 'w') {
    then = subWeeks(now, value);
  } else if (unit === 'm') {
    then = subMonths(now, value);
  }
  return { then, now };
}
