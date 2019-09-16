import { globalReducer } from 'react-hook-utils';

export default globalReducer(
  {},
  {
    load: (state, user) => {
      return {
        ...user,
        loaded: true,
        unsubCount: user.unsubscriptions.length || 0,
        hasCompletedOnboarding: user.milestones.completedOnboarding,
        hasCompletedOrganisationOnboarding:
          user.milestones.completedOnboardingOrganisation
      };
    },
    addUnsub: (state, data) => {
      return {
        ...state,
        unsubscriptions: [...state.unsubscriptions, data]
      };
    },
    updateReportedUnsub: (state, unsub) => {
      return {
        ...state,
        unsubscriptions: [
          ...state.unsubscriptions.filter(u => u.id !== unsub.id),
          unsub
        ]
      };
    },
    update: (state, user) => {
      return {
        ...state,
        ...user
      };
    },
    incrementUnsubCount: (state, count = 1) => {
      return {
        ...state,
        unsubCount: state.unsubCount + count
      };
    },
    setIgnoredSenderList: (state, list) => ({
      ...state,
      ignoredSenderList: list
    }),
    setReminder: (state, reminder) => ({
      ...state,
      reminder
    }),
    setLastScan: (state, scan) => ({
      ...state,
      lastScan: scan
    }),
    setPreferences: (state, preferences) => ({
      ...state,
      preferences
    }),
    setRequiresTwoFactorAuth: (state, bool) => ({
      ...state,
      requiresTwoFactorAuth: bool
    }),
    setMilestoneCompleted: (state, milestone) => {
      return {
        ...state,
        milestones: {
          ...state.milestones,
          [milestone]: true
        },
        hasCompletedOnboarding: milestone === 'completedOnboarding',
        hasCompletedOrganisationOnboarding:
          milestone === 'completedOnboardingOrganisation'
      };
    },
    setBilling: (state, billing) => {
      return {
        ...state,
        billing
      };
    },
    setCard: (state, card) => {
      return {
        ...state,
        billing: {
          ...state.billing,
          card
        }
      };
    },
    setCredits: (state, credits) => {
      return {
        ...state,
        billing: {
          ...state.billing,
          credits
        }
      };
    },
    incrementCredits: (state, credits) => {
      return {
        ...state,
        billing: {
          ...state.billing,
          credits: state.billing.credits + credits
        }
      };
    },
    setOrganisationLastUpdated: (state, lastUpdated) => {
      return {
        ...state,
        organisationLastUpdated: lastUpdated
      };
    },
    invalidateAccount: (state, accountId, problem) => {
      return {
        ...state,
        accounts: state.accounts.map(a => {
          if (a.id !== accountId) return a;
          return { ...a, problem };
        })
      };
    }
  }
);
