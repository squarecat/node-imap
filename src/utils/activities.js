import _capitalize from 'lodash.capitalize';
import _startCase from 'lodash.startcase';

const activityEnum = {
  sharedOnTwitter: ({ reward }) =>
    `You tweeted about us! You have earned ${
      reward.unsubscriptions
    } unsubscribes`,
  referralSignup: ({ reward }) =>
    `Someone just signed up through your referral link! You have both earned ${
      reward.unsubscriptions
    } unsubscribes`,
  signedUpFromReferral: ({ reward }) =>
    `You signed up using a referral link! You have both earned ${
      reward.unsubscriptions
    } unsubscribes`,
  referralPurchase: ({ reward }) =>
    `Someone you referred just paid for a scan! You have earned ${
      reward.unsubscriptions
    } unsubscribes`,
  connectedFirstAccount: ({ reward, data }) =>
    `You connected your first account (${data.provider}). You have earned ${
      reward.unsubscriptions
    } unsubscribes`,
  connectedAdditionalAccount: ({ reward, data }) =>
    `You connected another account (${data.provider}). You have earned ${
      reward.unsubscriptions
    } unsubscribes`,
  addedTwoFactorAuth: ({ reward }) =>
    `You made your account more secure with 2-factor auth. You have earned ${
      reward.unsubscriptions
    } unsubscribes`,

  // non reward
  packagePurchase: ({ data }) =>
    `You purchased a package of ${data.unsubscriptions} unsubscribes.`,
  removeAdditionalAccount: ({ data }) =>
    `You removed a connected account (${data.provider}).`
};

export function parseActivity(activity) {
  const { type } = activity;
  const activityFn = activityEnum[type];
  if (!activityFn) {
    console.error(`No matching activity for type ${type}`, { type });
    return _capitalize(_startCase(type));
  }
  return activityFn(activity);
}
