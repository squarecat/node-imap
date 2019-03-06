import { globalReducer } from 'react-hook-utils';

export default globalReducer(
  {},
  {
    load: (state, user) => {
      return {
        ...user,
        loaded: true,
        unsubCount: user.unsubscriptions.length || 0
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
      lastPaidScan: timeframe
    }),
    setLastScan: (state, scan) => ({
      ...state,
      lastScan: scan
    }),
    setPreferences: (state, preferences) => ({
      ...state,
      preferences
    })
  }
);
