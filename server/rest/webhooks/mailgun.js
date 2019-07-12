import {
  unsubscribeUserFromNewsletter,
  updateUserUnsubStatus,
  updateUserUnsubStatusById
} from '../../services/user';

import config from 'getconfig';
import crypto from 'crypto';
import logger from '../../utils/logger';

const signingKey = config.mailgun.apiKey;

export default app => {
  app.post('/webhooks/mailgun/unsubs', async (req, res) => {
    try {
      const { body } = req;
      if (!verify(body)) {
        throw new Error('mailgun: webhook failed to verify');
      }
      const eventData = body['event-data'];
      const { event: eventType } = eventData;
      const variables = eventData['user-variables'];
      const userId = variables['user-id'];
      const mailId = variables['email-id'];
      logger.info(`mailgun: webhook status ${eventType}`);
      if (!userId) {
        return res.sendStatus(200);
      }
      logger.info(`mailgun: webhook for mail ${mailId} & user ${userId}`);
      const { message } = eventData['delivery-status'];
      switch (eventType) {
        // Mailgun accepted the request to send/forward the email and the
        // message has been placed in queue."
        case 'accepted':
          break;
        // Mailgun rejected the request to send/forward the email.
        case 'rejected': {
          updateUserUnsubStatus(userId, {
            mailId,
            status: 'rejected',
            message
          });
          break;
        }
        // Mailgun sent the email and it was accepted by the recipient
        // email server.
        case 'delivered': {
          updateUserUnsubStatus(userId, {
            mailId,
            status: 'delivered',
            message
          });
          break;
        }
        // Mailgun could not deliver the email to the recipient email server.
        case 'failed': {
          updateUserUnsubStatus(userId, { mailId, status: 'failed', message });
          break;
        }
        // The email recipient opened the email and enabled image viewing.
        // Open tracking must be enabled in the Mailgun control panel, and
        // the CNAME record must be pointing to mailgun.org.
        case 'opened':
          break;
        // The email recipient clicked on a link in the email. Click
        // tracking must be enabled in the Mailgun control panel, and
        // the CNAME record must be pointing to mailgun.org.
        case 'clicked':
          break;
        // The email recipient clicked on the unsubscribe link.
        // Unsubscribe tracking must be enabled in the Mailgun
        // control panel.
        case 'unsubscribed':
          break;
        // The email recipient clicked on the spam complaint button
        // within their email client. Feedback loops enable the notification
        // to be received by Mailgun.
        case 'complained':
          break;
        // Mailgun has stored an incoming message
        case 'stored':
          break;
        default: {
          throw new Error(`Unknown event from mailgun: ${eventType}`);
        }
      }
      res.sendStatus(200);
    } catch (err) {
      logger.error('mailgun-webhook: failed to parse hook');
      logger.error(err);
      res.sendStatus(406);
    }
  });

  app.post('/webhooks/mailgun/message', async (req, res) => {
    const { body } = req;
    const { sender, recipient, subject, ['body-plain']: bodyPlain } = body;

    try {
      if (!verify(body)) {
        throw new Error('mailgun: webhook failed to verify');
      }
      // get the user and mail that this is in reference to
      const [, unsubscribeId] = recipient.match(/^(.+)-bot@.*$/);
      updateUserUnsubStatusById(unsubscribeId, {
        status: 'replied',
        sender,
        subject,
        bodyPlain
      });
    } catch (err) {
      logger.error('mailgun-webhook: failed to parse message reply');
      logger.error(err);
      res.sendStatus(500);
    }
  });

  app.post('/webhooks/mailgun/newsletter', async (req, res) => {
    try {
      const { body } = req;
      if (!verify(body)) {
        throw new Error('mailgun: webhook failed to verify');
      }
      const eventData = body['event-data'];
      const { event: eventType } = eventData;
      switch (eventType) {
        // Mailgun accepted the request to send/forward the email and the
        // message has been placed in queue.
        case 'accepted':
          break;
        // Mailgun rejected the request to send/forward the email.
        case 'rejected':
          break;
        // Mailgun sent the email and it was accepted by the recipient
        // email server.
        case 'delivered':
          break;
        // Mailgun could not deliver the email to the recipient email server.
        case 'failed': {
          const { recipient, reason } = eventData;
          logger.debug(
            `mailgun-webhook: newsletter failed request reason - ${reason}`
          );
          unsubscribeUserFromNewsletter(recipient, reason);
          break;
        }
        // The email recipient opened the email and enabled image viewing.
        // Open tracking must be enabled in the Mailgun control panel, and
        // the CNAME record must be pointing to mailgun.org.
        case 'opened':
          break;
        // The email recipient clicked on a link in the email. Click
        // tracking must be enabled in the Mailgun control panel, and
        // the CNAME record must be pointing to mailgun.org.
        case 'clicked':
          break;
        // The email recipient clicked on the unsubscribe link.
        // Unsubscribe tracking must be enabled in the Mailgun
        // control panel.
        case 'unsubscribed': {
          const { recipient } = eventData;
          logger.debug(`mailgun-webhook: newsletter unsubscribe request`);
          unsubscribeUserFromNewsletter(recipient);
          break;
        }
        // The email recipient clicked on the spam complaint button
        // within their email client. Feedback loops enable the notification
        // to be received by Mailgun.
        case 'complained':
          break;
        // Mailgun has stored an incoming message
        case 'stored':
          break;
        default: {
          throw new Error(
            `mailgun-webhook: unknown event from mailgun: ${eventType}`
          );
        }
      }
      res.sendStatus(200);
    } catch (err) {
      logger.error('mailgun-webhook: failed to parse hook');
      logger.error(err);
      res.sendStatus(406);
    }
  });
};

function verify({ signature: mailSig }) {
  const { token, timestamp, signature } = mailSig;
  const digest = crypto
    .createHmac('sha256', signingKey)
    .update(`${timestamp}${token}`)
    .digest('hex');
  return digest === signature;
}
