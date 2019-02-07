import { addScanToUser, getUserById, updatePaidScanForUser } from './user';
import { hasPaidScanAvailable, isMailUnsubscribable } from './utils';

import { getClient } from './imap';
import { getEstimateForTimeframe } from './estimator';
import { getMailClient } from './access';
import logger from '../../utils/logger';

export async function fetchMail(
  { userId, timeframe },
  { onMail, onError, onEnd, onProgress }
) {
  try {
    const { then, now } = getTimeRange(tf);
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

    logger.info('mail-service: -------- INBOX STARTED --------');
    let totalEmailsCount;

    s.on('data', d => {
      if (options.trash) {
        trashPerSecond.mark();
      } else {
        mailPerSecond.mark();
      }
      const mail = parseMailData(d);
      onMail(mail);
      totalEmailsCount++;
      progress = progress + 1;
      onProgress({ progress, total: totalEstimate });
    });

    s.on('timeout', onMailTimeout);
    s.on('error', onMailError);

    s.on('end', () => {
      logger.info('mail-service: -------- INBOX FINISHED --------');
      logger.info('mail-service: -------- TRASH STARTED --------');
      const t = gmail.messages(trashSearchStr, messageOptions);
      t.on('data', d => onMailData(d, { trash: true }));
      t.on('end', () => {
        logger.info('mail-service: -------- TRASH FINISHED --------');
        onScanFinished();
      });
      t.on('timeout', onMailTimeout);
      t.on('error', onMailError);
    });

    // let totalEmailsCount = 0;
    // let totalUnsubscribableEmailsCount = 0;
    // let totalPreviouslyUnsubscribedEmails = 0;
    let progress = 0;
    onProgress({ progress, total: totalEstimate });

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

function* mail(query, options = {}) {
  const messages = client.messages(query, options);
  yield 'foo';
  s.on('data', d => {
    if (options.trash) {
      trashPerSecond.mark();
    } else {
      mailPerSecond.mark();
    }
    const mail = parseMailData(d);
    yield mail;
  });
  s.on('timeout', onMailTimeout);
  s.on('error', onMailError);

  s.on('end', () => {
    logger.info('mail-service: -------- INBOX FINISHED --------');
    logger.info('mail-service: -------- TRASH STARTED --------');
    const t = gmail.messages(trashSearchStr, messageOptions);
    t.on('data', d => onMailData(d, { trash: true }));
    t.on('end', () => {
      logger.info('mail-service: -------- TRASH FINISHED --------');
      onScanFinished();
    });
    t.on('timeout', onMailTimeout);
    t.on('error', onMailError);
  });
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
