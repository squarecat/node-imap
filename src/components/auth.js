import './auth.module.scss';

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import { DatabaseContext } from '../providers/db-provider';
import Loading from './loading';
import { ModalContext } from '../providers/modal-provider';
import OnboardingModal from './modal/onboarding';
import { fetchLoggedInUser } from '../utils/auth';
import { useAsync } from 'react-use';
import useUser from '../utils/hooks/use-user';

function Auth({ children }) {
  const { error, value: user, loading: userLoading } = useAsync(
    fetchLoggedInUser,
    []
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
}

Auth.whyDidYouRender = true;

const UserAuth = React.memo(function UserAuth({ children }) {
  const db = useContext(DatabaseContext);
  const [isLoaded, setLoaded] = useState(false);
  const [{ id, isUserLoaded, hasCompletedOnboarding }] = useUser(s => ({
    id: s.id,
    isUserLoaded: s.loaded,
    hasCompletedOnboarding: s.hasCompletedOnboarding
  }));
  const { open: openModal } = useContext(ModalContext);

  const checkDb = useCallback(
    async () => {
      const prevId = await db.prefs.get('userId');
      if (prevId !== id) {
        await db.clear();
        db.prefs.put({ key: 'userId', value: id });
      }
      setLoaded(true);
    },
    [db, id]
  );

  useEffect(
    () => {
      if (isUserLoaded && !hasCompletedOnboarding) {
        openModal(<OnboardingModal />, {
          dismissable: false,
          opaque: true
        });
      }
      if (isUserLoaded) {
        // check db is this users data
        checkDb();
      }
    },
    [isUserLoaded, hasCompletedOnboarding, openModal, checkDb]
  );

  const showContent = useMemo(
    () => {
      return isLoaded && hasCompletedOnboarding;
    },
    [hasCompletedOnboarding, isLoaded]
  );

  return (
    <div styleName={`auth-loading ${!isLoaded ? '' : 'loaded'}`}>
      <Loading loaded={isLoaded} />
      <div styleName="loaded-content">{showContent ? children : null}</div>
    </div>
  );
});

UserAuth.whyDidYouRender = true;

export default Auth;
