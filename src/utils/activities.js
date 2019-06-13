import _capitalize from 'lodash.capitalize';
import _startCase from 'lodash.startcase';

// TODO remove duplicate calls to the reward text function
const activityEnum = {
  sharedOnTwitter: ({ reward }) => {
    const text = `You tweeted about us!`;
    return reward ? rewardText(text, reward) : text;
  },
  referralSignup: ({ reward }) => {
    const text = `Someone just signed up through your referral link!`;
    if (!reward) return text;
    return `${text} You have both earned ${reward.credits} credits`;
  },
  signedUpFromReferral: ({ reward }) =>
    `You signed up using a referral link! You have both earned ${
      reward.credits
    } credits`,
  referralPurchase: ({ reward }) => {
    const text = `Someone you referred just purchased their first package!`;
    return reward ? rewardText(text, reward) : text;
  },
  purchaseFromReferral: ({ reward }) =>
    `You purchased your first package using a referral link! You have both earned ${
      reward.credits
    } credits`,
  connectedFirstAccount: ({ reward, data }, user) => {
    const text = accountConnection(
      { reward, data, type: 'connectedFirstAccount' },
      user
    );
    return reward ? rewardText(text, reward) : text;
  },
  connectedAdditionalAccount: ({ reward, data }, user) => {
    const text = accountConnection(
      { reward, data, type: 'connectedAdditionalAccount' },
      user
    );
    return reward ? rewardText(text, reward) : text;
  },
  addedTwoFactorAuth: ({ reward }) => {
    const text = `You made your account more secure with two-factor authentication.`;
    return reward ? rewardText(text, reward) : text;
  },

  // non reward
  packagePurchase: ({ data }) => {
    if (data.price < 50) {
      return `You claimed a free package of ${data.credits} credits!`;
    }
    return `You purchased a package of ${data.credits} credits.`;
  },
  removeAdditionalAccount: ({ data }) =>
    `You removed a connected account (${_capitalize(data.provider)}).`,
  addedToOrganisation: ({ data }) =>
    `You added the account ${data.email} to your organistion ${data.name}.`,
  removedFromOrganisation: ({ data }) =>
    `You removed the account ${data.email} from your organistion ${data.name}.`,
  addBillingCard: () => `You added a saved payment method.`,
  removeBillingCard: () => `You removed your saved payment method.`,
  updatedPackageAutoBuyPreference: ({ data }) =>
    `You ${
      data.autoBuy ? 'enabled' : 'disabled'
    } the package auto-buy preference`
};

export function parseActivity(activity, user) {
  const { type } = activity;
  const activityFn = activityEnum[type];
  if (!activityFn) {
    console.error(`No matching activity for type ${type}`, { type });
    return _capitalize(_startCase(type));
  }
  return activityFn(activity, user);
}

function rewardText(text, { credits }) {
  return `${text} You have earned ${credits} credits.`;
}

function accountConnection({ reward, data, type }, user) {
  const provider = _capitalize(data.provider);
  const typeText = type === 'connectedFirstAccount' ? 'your first' : 'another';
  let text = `You connected ${typeText} account`;
  if (!user || !user.accounts) {
    return `${text} (${provider}).`;
  }
  const email = user.accounts.find(a => a.id === data.id).email;
  return `${text} (${provider} - ${email}).`;
}
