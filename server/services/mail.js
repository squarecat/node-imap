import Gmail from 'node-gmail-api';
import url from 'url';
import subDays from 'date-fns/sub_days';
import subWeeks from 'date-fns/sub_weeks';
import subMonths from 'date-fns/sub_months';
import format from 'date-fns/format';
import emailAddresses from 'email-addresses';
import io from '@pm2/io';
import subMinutes from 'date-fns/sub_minutes';
import isAfter from 'date-fns/is_after';
import subHours from 'date-fns/sub_hours';
import isBefore from 'date-fns/is_before';

import { refreshAccessToken } from '../auth';

const mailPerSecond = io.meter({
  name: 'mail/sec'
});
const trashPerSecond = io.meter({
  name: 'trash/sec'
});

import { emailStringIsEqual } from '../utils/parsers';
import { getUnsubscribeImage } from '../dao/user';
import { isHashEqual } from '../dao/encryption';
import {
  getUserById,
  addUnsubscriptionToUser,
  addScanToUser,
  resolveUserUnsubscription,
  updatePaidScanForUser
} from './user';

import {
  addUnsubscriptionToStats,
  addFailedUnsubscriptionToStats,
  addScanToStats,
  addNumberofEmailsToStats,
  addEstimateToStats
} from './stats';

import { unsubscribeWithLink } from '../utils/browser';
import { sendUnsubscribeMail } from '../utils/email';
import {
  addResolvedUnsubscription,
  addUnresolvedUnsubscription
} from '../dao/subscriptions';

const googleDateFormat = 'YYYY/MM/DD';
const estimateTimeframes = ['3d', '1w'];

function getAccessToken(user) {
  const { keys, id: userId } = user;
  const { accessToken, refreshToken, expires, expiresIn } = keys;

  if (isBefore(subMinutes(expires, 5), new Date())) {
    return refreshAccessToken(userId, { refreshToken, expiresIn });
  }
  return accessToken;
}

export async function getMailEstimates(userId) {
  const user = await getUserById(userId);
  const accessToken = await getAccessToken(user);
  const gmail = new Gmail(accessToken);
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

  addEstimateToStats();
  return estimates;
}

export async function scanMail(
  { userId, timeframe },
  { onMail, onError, onEnd, onProgress }
) {
  try {
    let dupes = [];

    const { then, now } = getTimeRange(timeframe);

    const user = await getUserById(userId);
    if (!hasPaidScanAvailable(user, timeframe)) {
      console.log('mail: User attempted search that has not been paid for');
      return onError('Not paid');
    }
    const accessToken = await getAccessToken(user);
    const gmail = new Gmail(accessToken);
    const { unsubscriptions, ignoredSenderList } = user;
    const searchStr = getSearchString({ then, now });
    const trashSearchStr = getSearchString({ then, now, query: 'in:trash' });
    let total;
    console.log('mail-service: getting estimate');

    if (timeframe === '1m' || timeframe === '6m') {
      const { then: estimateThen } = getTimeRange('1w');
      const estimatedSearchString = getSearchString({
        then: estimateThen,
        now
      });
      const trashEstimatedSearchString = getSearchString({
        then: estimateThen,
        now,
        query: 'in:trash'
      });
      const oneWTotal = await getEstimatedEmails(estimatedSearchString, gmail);
      const trashOneWTotal = await getEstimatedEmails(
        trashEstimatedSearchString,
        gmail
      );
      const combinedOneWTotal = oneWTotal + trashOneWTotal;
      total =
        timeframe === '1m' ? combinedOneWTotal * 4 : combinedOneWTotal * 4 * 6;
    } else {
      const estimatedTotal = await getEstimatedEmails(searchStr, gmail);
      const trashEstimatedTotal = await getEstimatedEmails(
        trashSearchStr,
        gmail
      );
      total = estimatedTotal + trashEstimatedTotal;
    }
    console.log('mail-service: total', total);
    console.log('mail-service: doing scan... ', userId, timeframe, searchStr);
    console.log(
      'mail-service: doing trash scan... ',
      userId,
      timeframe,
      trashSearchStr
    );

    let totalEmailsCount = 0;
    let totalUnsubscribableEmailsCount = 0;
    let totalPreviouslyUnsubscribedEmails = 0;
    let progress = 0;

    onProgress({ progress, total });

    const onMailData = (m, options = {}) => {
      if (options.trash) {
        trashPerSecond.mark();
      } else {
        mailPerSecond.mark();
      }
      if (isUnsubscribable(m, ignoredSenderList)) {
        const mail = mapMail(m, options);
        if (mail) {
          const prevUnsubscriptionInfo = hasUnsubscribedAlready(
            mail,
            unsubscriptions
          );
          // don't send duplicates
          const hasDupe = dupes.some(
            dupe =>
              emailStringIsEqual(dupe.from, mail.from) &&
              emailStringIsEqual(dupe.to, mail.to)
          );
          if (mail && !hasDupe) {
            dupes = [...dupes, { to: mail.to, from: mail.from }];
            if (prevUnsubscriptionInfo) {
              totalPreviouslyUnsubscribedEmails++;
              onMail({ ...mail, subscribed: false, ...prevUnsubscriptionInfo });
            } else {
              onMail({ ...mail, subscribed: true });
            }
            totalUnsubscribableEmailsCount++;
          }
        }
      }
      totalEmailsCount++;
      progress = progress + 1;
      onProgress({ progress, total });
    };

    const onScanFinished = () => {
      console.log('mail-service: scan finished');
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
      if (timeframe !== '3d') {
        updatePaidScanForUser(userId, timeframe);
      }
      onEnd();
    };

    const onMailTimeout = err => {
      console.error('mail-service: gmail timeout');
      console.error(err);
      onError(err.toString());
    };

    const onMailError = err => {
      console.error('mail-service: gmail error');
      console.error(err);
      onError(err.toString());
    };

    const messageOptions = {
      timeout: 10000,
      max: 10000
    };

    console.log('mail-service: -------- INBOX STARTED --------');
    const s = gmail.messages(searchStr, messageOptions);

    s.on('data', onMailData);
    s.on('timeout', onMailTimeout);
    s.on('error', onMailError);

    s.on('end', () => {
      console.log('mail-service: -------- INBOX FINISHED --------');
      console.log('mail-service: -------- TRASH STARTED --------');
      const t = gmail.messages(trashSearchStr, messageOptions);
      t.on('data', d => onMailData(d, { trash: true }));
      t.on('end', () => {
        console.log('mail-service: -------- TRASH FINISHED --------');
        onScanFinished();
      });
      t.on('timeout', onMailTimeout);
      t.on('error', onMailError);
    });
  } catch (err) {
    onError(err.toString());
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
      unsubscribeStrategy: unsubStrategy,
      unsubscribeLink,
      unsubscribeMailTo,
      estimatedSuccess: output.estimatedSuccess
    });
    if (output.estimatedSuccess) addUnsubscriptionToStats({ unsubStrategy });
    return {
      id: output.id,
      estimatedSuccess: output.estimatedSuccess,
      image: !!output.image,
      unsubStrategy
    };
  } catch (err) {
    console.error('mail-service: error unsubscribing from mail', mail.id);
    console.error(err);
    throw err;
  }
}

export async function addUnsubscribeErrorResponse(
  { mailId, success, from, image = null, reason = null, unsubStrategy },
  userId
) {
  console.log(
    `mail-service: add unsubscribe error response, success: ${success}`
  );
  const domain = getDomain(from);
  if (success) {
    return Promise.all([
      addUnsubscriptionToStats({ unsubStrategy }),
      addResolvedUnsubscription({ mailId, image, domain, unsubStrategy }),
      resolveUserUnsubscription(userId, mailId)
    ]);
  }
  return Promise.all([
    addFailedUnsubscriptionToStats(),
    addUnresolvedUnsubscription({
      mailId,
      image,
      domain,
      reason,
      unsubStrategy
    }),
    resolveUserUnsubscription(userId, mailId)
  ]);
}

function isUnsubscribable(mail = {}, ignoredSenderList = []) {
  const { id, payload } = mail;

  if (!payload) {
    console.error(
      'mail-service: cannot check if unsubscribable, mail object has no payload',
      id
    );
    if (!id) {
      console.error('mail-service: mail id undefined');
      console.error(mail);
    }
    return false;
  }

  const { headers = [] } = payload;
  const hasListUnsubscribe = headers.some(h => h.name === 'List-Unsubscribe');
  const from = headers.find(h => h.name === 'From').value;
  let pureFromEmail;
  if (from.match(/^.*<.*>/)) {
    const [, , email] = /^(.*)<(.*)>/.exec(from);
    pureFromEmail = email;
  } else {
    pureFromEmail = from;
  }
  const isIgnoredSender = ignoredSenderList.some(
    sender => sender === pureFromEmail
  );
  return hasListUnsubscribe && !isIgnoredSender;
}

function mapMail(mail, { trash = false } = {}) {
  const { payload, id, snippet, internalDate, labelIds } = mail;

  try {
    if (!payload) {
      throw new Error('mail object has no payload', id);
    }

    const isTrash = trash || labelIds.includes('TRASH');
    const unsub = payload.headers.find(h => h.name === 'List-Unsubscribe')
      .value;
    const { unsubscribeMailTo, unsubscribeLink } = getUnsubValues(unsub);
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
      unsubscribeMailTo,
      isTrash
    };
  } catch (err) {
    console.error('mail-service: error mapping mail');
    console.error(err);
    return null;
  }
}

export function getImage(userId, mailId) {
  return getUnsubscribeImage(userId, mailId);
}

function getSearchString({ then, query = '' }) {
  const thenStr = format(then, googleDateFormat);
  return `after:${thenStr} ${query}`;
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

    const sent = await sendUnsubscribeMail({ toAddress, ...params });
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
  const unsubInfo = unsubscriptions.find(
    u => mail.from === u.from && mail.to === u.to
  );
  if (!unsubInfo) {
    return null;
  }
  const { image, unsubStrategy, estimatedSuccess, resolved } = unsubInfo;
  return { image, unsubStrategy, estimatedSuccess, resolved };
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

function getUnsubValue(str) {
  if (str.trim().match(/^<.+>$/)) {
    return str.substr(1, str.length - 2);
  }
  return str;
}

// a scan is available if it has not yet been
// completed, or it was completed in the last
// 24 hours
function hasPaidScanAvailable(user, scanType) {
  const yesterday = subHours(Date.now(), 24);
  if (scanType === '3d' || user.beta) return true;
  return (user.paidScans || []).some(s => {
    if (s.scanType === scanType) {
      const performedWithin24Hrs = isAfter(s.paidAt, yesterday);
      return !s.performed || performedWithin24Hrs;
    }
    return false;
  });
}
