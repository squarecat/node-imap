const activityEnum = {
  sharedOnTwitter: ({ rewardCredits }) => {
    const text = `You tweeted about us!`;
    if (!rewardCredits) return text;
    return `${text} You earned ${rewardCredits} credits.`;
  },
  referralSignUp: ({ rewardCredits }) => {
    const text = `Someone just signed up through your referral link!`;
    if (!rewardCredits) return text;
    return `${text} You earned ${rewardCredits} credits.`;
  },
  signedUpFromReferral: ({ rewardCredits }) =>
    `You signed up using a referral link! You earned ${rewardCredits} credits.`,
  // referralPurchase: ({ rewardCredits }) => {
  // const text = `Someone you referred just purchased their first package!`;
  // if (!rewardCredits) return text;
  // return `${text} You earned ${rewardCredits} credits.`;
  // },
  // purchaseFromReferral: ({ rewardCredits }) => {
  // const text = `You purchased your first package using a referral link!`;
  // if (!rewardCredits) return text;
  // return `${text} You both earned ${rewardCredits} credits.`;
  // },
  connectedFirstAccount: ({ rewardCredits, data }) => {
    const text = `You connected your first account - ${data.email}.`;
    if (!rewardCredits) return text;
    return `${text} You earned ${rewardCredits} credits.`;
  },
  connectedAdditionalAccount: ({ rewardCredits, data }) => {
    const text = `You connected another account - ${data.email}.`;
    if (!rewardCredits) return text;
    return `${text} You earned ${rewardCredits} credits.`;
  },
  addedTwoFactorAuth: ({ rewardCredits }) => {
    const text = `You made your account more secure with two-factor authentication.`;
    if (!rewardCredits) return text;
    return `${text} You earned ${rewardCredits} credits.`;
  },

  // non reward
  packagePurchase: ({ data }) => {
    if (data.price < 50) {
      return `You claimed a free package of ${data.credits} credits!`;
    }
    return `You purchased a package of ${data.credits} credits.`;
  },
  removeAdditionalAccount: ({ data }) =>
    `You removed a connected account - ${data.email}.`,
  joinedOrganisation: ({ data }) => `You joined the ${data.name} team.`,
  leftOrganisation: ({ data }) => `You left the ${data.name} team.`,
  addedAccountToOrganisation: ({ data }) =>
    `You added the account ${data.email} to your team ${data.name}.`,
  removedAccountFromOrganisation: ({ data }) =>
    `You removed the account ${data.email} from your team ${data.name}.`,
  addBillingCard: () => `You added a saved payment method.`,
  removeBillingCard: () => `You removed your saved payment method.`
};

export function parseActivity(activity, user) {
  const { type } = activity;
  const activityFn = activityEnum[type];
  if (!activityFn) {
    return null;
  }
  return activityFn(activity, user);
}
