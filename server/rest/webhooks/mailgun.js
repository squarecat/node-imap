import {
  updateUserMarketingConsent,
  updateUserUnsubStatus
} from '../../services/user';

import logger from '../../utils/logger';

export default app => {
  app.post('/webhooks/mailgun/unsubs', async (req, res) => {
    try {
      const { body } = req;
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
      res.sendStatus(406);
    }
  });

  app.post('/webhooks/mailgun/newsletter', async (req, res) => {
    try {
      const { body } = req;
      const eventData = body['event-data'];
      const { event: eventType } = eventData;
      switch (eventType) {
        // Mailgun accepted the request to send/forward the email and the
        // message has been placed in queue."
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
          updateUserMarketingConsent(recipient, false);
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
          throw new Error(`Unknown event from mailgun: ${eventType}`);
        }
      }
      res.sendStatus(200);
    } catch (err) {
      logger.error('mailgun-webhook: failed to parse hook');
      res.sendStatus(406);
    }
  });
};
