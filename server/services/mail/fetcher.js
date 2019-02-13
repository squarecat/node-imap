import { addScanToUser, getUserById, updatePaidScanForUser } from './user';
import {
  getSearchString,
  getTimeRange,
  hasPaidScanAvailable,
  isMailUnsubscribable
} from './utils';

import { getClient } from './imap';
import { getEstimateForTimeframe } from './estimator';
import { getMailClient } from './access';
import logger from '../../utils/logger';

export async function fetchMail(
  { userId, timeframe },
  { onMail, onError, onEnd, onProgress }
) {
  try {
    const user = await getUserById(userId);
    if (!hasPaidScanAvailable(user, timeframe)) {
      logger.warn(
        'mail-service: User attempted search that has not been paid for'
      );
      return onError('Not paid');
    }
    const { unsubscriptions, ignoredSenderList } = user;
    const [totalEstimate, client] = await Promise.all([
      getEstimateForTimeframe(user, {
        timeframe,
        includeTrash: true
      }),
      getMailClient('gmail', user)
    ]);

    let totalEmailsCount;

    logger.info('mail-service: -------- INBOX STARTED --------');

    for (let mail of await fetchMailApi(client, { timeframe })) {
      console.log(`got ${mail.length} mail items!`);
      mailPerSecond.mark();
      const m = parseMailData(d);
      totalEmailsCount = totalEmailsCount + mail.length;
      progress = progress + mail.length;
      onMail(mail);
      onProgress({ progress, total: totalEstimate });
    }

    const onMailData = (m, options = {}) => {
      if (options.trash) {
        trashPerSecond.mark();
      } else {
        mailPerSecond.mark();
      }
      if (isMailUnsubscribable(m, ignoredSenderList)) {
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
              onMail({
                ...mail,
                subscribed: false,
                ...prevUnsubscriptionInfo
              });
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
      logger.info('mail-service: scan finished');
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
      logger.error('mail-service: gmail timeout');
      logger.error(err);
      onError(err.toString());
    };

    const onMailError = err => {
      logger.error('mail-service: gmail error');
      logger.error(err);
      onError(err.toString());
    };

    const messageOptions = {
      timeout: 10000,
      max: 50000
    };
  } catch (err) {
    onError(err.toString());
  }
}

export async function fetchMailImap(provider = 'gmail', user) {
  if (provider === 'gmail') {
    try {
      const client = await getClient(user);
      client.onerror = err => console.error(err);
      console.log('authenticating with imap');
      await client.connect();
      console.log('fetching');
      const results = await client.search('INBOX', {
        since: new Date(2019, 1, 1, 0, 0, 0)
      });
      console.log(results);
    } catch (err) {
      console.error(err);
    }
  } else {
    console.error('unsupported client');
  }
}

async function* fetchMailApi(client, { timeframe }) {
  let pageToken;
  const { then, now } = getTimeRange(timeframe);
  const query = getSearchString({
    then,
    now
  });
  const fields =
    'messages(id,internalDate,labelIds,payload/headers,snippet),nextPageToken';
  do {
    const { data, nextPageToken } = await client.users.messages.list({
      userId: 'me',
      requestBody: {
        fields,
        q: query,
        maxResults: 100,
        pageToken,
        includeSpamTrash: true
      }
    });
    pageToken = nextPageToken;
    yield data;
  } while (pageToken);
}
