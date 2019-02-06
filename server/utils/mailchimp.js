import config from 'getconfig';
import md5 from 'md5';
import Mailchimp from 'mailchimp-api-v3';
import logger from './logger';

const { apiKey, lists } = config.mailchimp;
const mailchimpClient = new Mailchimp(apiKey);

// POST /lists/{list_id}/members
export async function addSubscriber({ email }) {
  logger.debug('mailchimp: adding subscriber');
  try {
    const url = `/lists/${lists.leaveMeAloneCustomers}/members`;
    await mailchimpClient.post(url, {
      email_address: email,
      status: 'subscribed'
    });
  } catch (err) {
    logger.error(`mailchimp: failed to add subscriber`);
    if (err.title === 'Member Exists') {
      logger.error('mailchimp: subscriber already exists');
      return true;
    }
    throw err;
  }
  return true;
}

// DELETE /lists/{list_id}/members/{subscriber_hash}
export async function removeSubscriber({ email }) {
  logger.debug('mailchimp: removing subscriber');
  try {
    const subscriberHash = md5(email);
    const url = `/lists/${
      lists.leaveMeAloneCustomers
    }/members/${subscriberHash}`;
    await mailchimpClient.delete(url);
  } catch (err) {
    logger.error(`mailchimp: failed to remove subscriber`);
  }
  return true;
}
