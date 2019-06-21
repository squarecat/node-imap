import './auth.module.scss';

import React, { useContext, useEffect, useMemo } from 'react';
import { useAsync, useLoader } from '../utils/hooks';

import Loading from './loading';
import { ModalContext } from '../providers/modal-provider';
import OnboardingModal from './modal/onboarding';
import { fetchLoggedInUser } from '../utils/auth';
import useUser from '../utils/hooks/use-user';

export default ({ children }) => {
  const { error, value: user, loading: userLoading } = useAsync(
    fetchLoggedInUser,
    [],
    {
      minWait: 2000
    }
  );
  const [, { load }] = useUser(s => s.loaded);

  useEffect(
    () => {
      if (!userLoading && !user) {
        window.location.pathname = '/login';
      } else if (!userLoading && user) {
        load(user);
      }
    },
    [load, user, userLoading]
  );

  if (error) {
    return <span>{error}</span>;
  }
  return <UserAuth>{children}</UserAuth>;
};

function UserAuth({ children }) {
  const [{ isUserLoaded, hasCompletedOnboarding }] = useUser(s => ({
    isUserLoaded: s.loaded,
    hasCompletedOnboarding: s.hasCompletedOnboarding
  }));
  const { open: openModal } = useContext(ModalContext);

  useEffect(
    () => {
      if (isUserLoaded && !hasCompletedOnboarding) {
        openModal(<OnboardingModal />, {
          dismissable: false,
          opaque: true
        });
      }
    },
    [isUserLoaded, hasCompletedOnboarding, openModal]
  );

  const showContent = useMemo(
    () => {
      return isUserLoaded && hasCompletedOnboarding;
    },
    [hasCompletedOnboarding, isUserLoaded]
  );

  return (
    <div styleName={`auth-loading ${!isUserLoaded ? '' : 'loaded'}`}>
      <Loading loaded={isUserLoaded} />
      <div styleName="loaded-content">{showContent ? children : null}</div>
    </div>
  );
}
