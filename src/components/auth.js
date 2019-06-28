import './auth.module.scss';

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import AlertModal from './modal/alert-modal';
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

const UserAuth = React.memo(function UserAuth({ children }) {
  const db = useContext(DatabaseContext);
  const { value: isBrowserSupported, loading, error } = useAsync(
    () => checkBrowserSupported(db),
    [db]
  );
  const [{ id, isUserLoaded, hasCompletedOnboarding }] = useUser(s => ({
    id: s.id,
    isUserLoaded: s.loaded,
    hasCompletedOnboarding: s.hasCompletedOnboarding
  }));
  const [isLoaded, setLoaded] = useState(isUserLoaded);
  const { open: openModal } = useContext(ModalContext);

  const checkDb = useCallback(
    async () => {
      const prevId = await db.prefs.get('userId');
      if (!prevId || prevId.value !== id) {
        await db.clear();
        db.prefs.put({ key: 'userId', value: id });
      }
      setLoaded(true);
    },
    [db, id]
  );

  useEffect(
    () => {
      if (isBrowserSupported === false) {
        openModal(
          <AlertModal>
            <p>
              We're sorry but due to the way we show your email data we don't
              currently support the browser you're using.
            </p>
            <p>
              Leave Me Alone should work in the latest versions of Edge,
              Firefox, Chrome, Safari, or other modern browsers.
            </p>
            <p>
              Think you are seeing this message by mistake? Please{' '}
              <a onClick={() => window.intergram.open()}>let us know</a>.
            </p>
          </AlertModal>,
          {
            dismissable: false,
            opaque: true
          }
        );
      }
      if (isUserLoaded && !hasCompletedOnboarding) {
        openModal(<OnboardingModal />, {
          dismissable: false,
          opaque: true
        });
      }
      if (isUserLoaded && isBrowserSupported) {
        // check db is this users data
        checkDb();
      }
    },
    [
      isUserLoaded,
      hasCompletedOnboarding,
      openModal,
      checkDb,
      isBrowserSupported
    ]
  );

  const content = useMemo(
    () => {
      if (isLoaded && hasCompletedOnboarding && isBrowserSupported) {
        return children;
      } else {
        return null;
      }
    },
    [children, hasCompletedOnboarding, isBrowserSupported, isLoaded]
  );

  return (
    <div styleName={`auth-loading ${!isLoaded ? '' : 'loaded'}`}>
      <Loading loaded={isLoaded} />
      <div styleName="loaded-content">{content}</div>
    </div>
  );
});

export default Auth;

async function checkBrowserSupported(db) {
  let unsupported = [];
  try {
    await db.prefs.put({ key: 'browser-supported', value: true });
  } catch (err) {
    console.error(err);
    unsupported = [...unsupported, 'indexDB'];
  }

  if (unsupported.length) {
    console.warn(`browser does not support ${unsupported.join(', ')}`);
    return false;
  }
  return true;
}
