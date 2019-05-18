import { globalReducer } from 'react-hook-utils';

export default globalReducer(
  {},
  {
    load: (state, user) => {
      return {
        ...user,
        loaded: true,
        unsubCount: user.unsubscriptions.length || 0,
        hasCompletedOnboarding: user.milestones.completedOnboarding
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
    setLastPaidScanType: (state, timeframe) => ({
      ...state,
      lastPaidScanType: timeframe
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
    setMilestoneCompleted: (state, milestone) => ({
      ...state,
      milestones: {
        ...state.milestones,
        [milestone]: true
      }
    }),
    setBilling: (state, billing) => {
      return {
        ...state,
        billing
      };
    }
  }
);
