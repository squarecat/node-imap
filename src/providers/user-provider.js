import request from '../utils/request';
import React, { createContext, useReducer, useEffect, useMemo } from 'react';

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, {
    loaded: false
  });

  const value = useMemo(() => [state, dispatch], [state, dispatch]);

  // load user once on mount
  useEffect(() => {
    fetchLoggedInUser().then(response => {
      if (!response) {
        window.location.pathname = '/login';
        return;
      }
      dispatch({ type: 'load', data: response });
    });
  }, []);

  console.log('[user]: ', value);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

const userReducer = (state, action) => {
  console.debug(`[user]: ${action.type}`);
  const { data, type } = action;
  if (type === 'load') {
    const user = data;
    return {
      ...user,
      loaded: true,
      unsubCount: user.unsubscriptions.length || 0,
      hasCompletedOnboarding: user.milestones.completedOnboarding,
      hasCompletedOrganisationOnboarding:
        user.milestones.completedOnboardingOrganisation
    };
  }
  if (type === 'add-unsub') {
    return {
      ...state,
      unsubscriptions: [...state.unsubscriptions, data]
    };
  }
  if (type === 'update-reported-unsub') {
    return {
      ...state,
      unsubscriptions: [
        ...state.unsubscriptions.filter(u => u.id !== data.id),
        data
      ]
    };
  }
  if (type === 'update') {
    return {
      ...state,
      ...data
    };
  }
  if (type === 'increment-unsub-count') {
    const count = typeof data === 'undefined' ? 1 : data;
    return {
      ...state,
      unsubCount: state.unsubCount + count
    };
  }
  if (type === 'set-ignored') {
    return {
      ...state,
      ignoredSenderList: data
    };
  }
  if (type === 'set-reminder') {
    return {
      ...state,
      reminder: data
    };
  }
  if (type === 'set-last-scan') {
    return {
      ...state,
      lastScan: data
    };
  }
  if (type === 'set-preferences') {
    return {
      ...state,
      preferences: data
    };
  }
  if (type === 'set-requires-two-factor-auth') {
    return {
      ...state,
      requiresTwoFactorAuth: data
    };
  }
  if (type === 'set-browser-id') {
    return {
      ...state,
      browserUuid: data
    };
  }
  if (type === 'set-milestone-completed') {
    let updates = {
      ...state,
      milestones: {
        ...state.milestones,
        [data]: true
      }
    };
    if (type === 'completed-onboarding') {
      updates = {
        ...updates,
        hasCompletedOnboarding: true
      };
    }
    if (type === 'completed-onboarding-organisation') {
      updates = {
        ...updates,
        hasCompletedOrganisationOnboarding: true
      };
    }
    return updates;
  }
  if (type === 'set-billing') {
    return {
      ...state,
      billing: data
    };
  }
  if (type === 'set-card') {
    return {
      ...state,
      billing: {
        ...state.billing,
        card: data
      }
    };
  }
  if (type === 'set-credits') {
    return {
      ...state,
      billing: {
        ...state.billing,
        credits: data
      }
    };
  }
  if (type === 'increment-credits') {
    return {
      ...state,
      billing: {
        ...state.billing,
        credits: state.billing.credits + data
      }
    };
  }
  if (type === 'set-organisation') {
    const organisation = data;
    return {
      ...state,
      organisationId: organisation.id,
      organisation: {
        id: organisation.id,
        name: organisation.name,
        active: organisation.active,
        domain: organisation.domain,
        inviteCode: organisation.inviteCode,
        allowAnyUserWithCompanyEmail: organisation.allowAnyUserWithCompanyEmail
      }
    };
  }
  if (type === 'set-organisation-last-updated') {
    return {
      ...state,
      organisationLastUpdated: data
    };
  }
  if (type === 'invalidate-account') {
    const { accountId, problem } = data;
    return {
      ...state,
      accounts: state.accounts.map(a => {
        if (a.id !== accountId) return a;
        return { ...a, problem };
      })
    };
  }

  return state;
};

export async function fetchLoggedInUser() {
  try {
    const user = await request('/api/me', {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    });
    window.intergramOnOpen = {
      userData: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      },
      userId: user.id,
      private: true
    };
    // if there is an active chat id then we want to replace it with
    // the real user id now, but make it clear that the chat is the same
    localStorage.setItem('userId', user.id);
    return user;
  } catch (err) {
    return null;
  }
}
