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
import JoinedTeamModal from './modal/onboarding/joined-team';
import Loading from './loading';
import { ModalContext } from '../providers/modal-provider';
import OnboardingModal from './modal/onboarding';
import OrganisationOnboardingModal from './modal/organisation-onboarding';
import { fetchLoggedInUser } from '../utils/auth';
import { openChat } from '../utils/chat';
import useAsync from 'react-use/lib/useAsync';
import useUser from '../utils/hooks/use-user';

function Auth({ children }) {
  const { error, value: user, loading: userLoading } = useAsync(
    fetchLoggedInUser,
    []
  );
  const [, { load }] = useUser(s => s.loaded);

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.pathname = '/login';
    } else if (!userLoading && user) {
      load(user);
    }
  }, [load, user, userLoading]);

  if (error) {
    return <span>{error}</span>;
  }
  return <UserAuth>{children}</UserAuth>;
}

const UserAuth = React.memo(function UserAuth({ children }) {
  const db = useContext(DatabaseContext);
  const { testingBrowser, browserId } = useBrowserSupported(db);
  console.log('use browser support', browserId);
  const [
    {
      id,
      isUserLoaded,
      hasCompletedOnboarding,
      organisationAdmin,
      organisationId,
      hasCompletedOrganisationOnboarding,
      accounts
    },
    { setBrowserId }
  ] = useUser(s => ({
    id: s.id,
    isUserLoaded: s.loaded,
    organisationAdmin: s.organisationAdmin,
    organisationId: s.organisationId,
    hasCompletedOnboarding: s.hasCompletedOnboarding,
    hasCompletedOrganisationOnboarding: s.hasCompletedOrganisationOnboarding,
    accounts: s.accounts
  }));

  const [isLoaded, setLoaded] = useState(isUserLoaded);
  const { open: openModal } = useContext(ModalContext);

  useEffect(() => {
    if (browserId) {
      setBrowserId(browserId);
    }
  }, [browserId, setBrowserId]);

  const checkDb = useCallback(async () => {
    const prevId = await db.prefs.get('userId');
    if (!prevId || prevId.value !== id) {
      console.log('clearing db');
      await db.clear();
      db.prefs.put({ key: 'userId', value: id });
    }
    setLoaded(true);
  }, [db, id]);

  const {
    teamAdminOnboarding,
    teamMemberOnboarding,
    userOnboarding
  } = useMemo(() => {
    // admin and not seen team onboarding
    const teamAdminOnboarding =
      isUserLoaded &&
      (!!organisationAdmin && !hasCompletedOrganisationOnboarding);

    // has seen regular onboarding, has recently joined a team, not seen team onboarding
    const teamMemberOnboarding =
      isUserLoaded &&
      (!!hasCompletedOnboarding &&
        !organisationAdmin &&
        !!organisationId &&
        !hasCompletedOrganisationOnboarding);

    // team admins dont see normal onboarding
    const userOnboarding =
      isUserLoaded && (!organisationAdmin && !hasCompletedOnboarding);

    return { teamAdminOnboarding, teamMemberOnboarding, userOnboarding };
  }, [
    isUserLoaded,
    hasCompletedOnboarding,
    hasCompletedOrganisationOnboarding,
    organisationAdmin,
    organisationId
  ]);

  useEffect(() => {
    console.log('browser id inner ', browserId);
    if (testingBrowser) {
      return;
    }
    if (browserId === null) {
      setLoaded(true);
      openModal(
        <AlertModal>
          <p>
            We're sorry but due to the way we show your email data we don't
            currently support the browser you're using.
          </p>
          <p>
            Leave Me Alone should work in the latest versions of Edge, Firefox,
            Chrome, Safari, or other modern browsers.
          </p>
          <p>
            If you are using Firefox or Chrome in Incognito/Private mode, then
            you also may experience issues.
          </p>
          <p>
            Think you are seeing this message by mistake? Please{' '}
            <a onClick={() => openChat()}>let us know</a>.
          </p>
        </AlertModal>,
        {
          dismissable: false,
          opaque: true
        }
      );
    } else if (teamAdminOnboarding) {
      // user is an organisation admin and needs the team onboarding
      openModal(<OrganisationOnboardingModal />, {
        dismissable: false,
        opaque: true
      });
    } else if (userOnboarding) {
      openModal(<OnboardingModal />, {
        dismissable: false,
        opaque: true
      });
    } else if (teamMemberOnboarding) {
      openModal(<JoinedTeamModal />, {
        dismissable: false,
        opaque: true
      });
    }

    if (isUserLoaded && !hasCompletedOnboarding && accounts.length) {
      // clear old data from v1
      console.log('removing old v1 data');
      Object.keys(localStorage).forEach(key => {
        if (/^leavemealone/.test(key)) {
          localStorage.removeItem(key);
        }
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
      });
    }
    if (isUserLoaded && browserId) {
      // check db is this users data
      checkDb();
    }
  }, [isUserLoaded, hasCompletedOnboarding, organisationAdmin, organisationId, hasCompletedOrganisationOnboarding, openModal, checkDb, accounts, teamAdminOnboarding, userOnboarding, teamMemberOnboarding, browserId, testingBrowser]);

  const content = useMemo(() => {
    if (!isLoaded) return null;
    if (
      !teamAdminOnboarding &&
      !teamMemberOnboarding &&
      !userOnboarding &&
      browserId
    ) {
      return children;
    } else {
      return null;
    }
  }, [
    isLoaded,
    teamAdminOnboarding,
    teamMemberOnboarding,
    userOnboarding,
    browserId,
    children
  ]);

  return (
    <div styleName={`auth-loading ${!isLoaded ? '' : 'loaded'}`}>
      <Loading loaded={isLoaded} />
      <div styleName="loaded-content">{content}</div>
    </div>
  );
});

export default Auth;

function useBrowserSupported(db) {
  console.log('checking browser');
  const [state, setState] = useState({ testingBrowser: true, browserId: null });

  useEffect(() => {
    db.transaction('rw', 'prefs', async () => {
      await db.prefs.put({ key: 'browser-supported', value: true });
      console.log('browser supported');
      const res = await db.prefs.get({
        key: 'browser-id'
      });
      let id = res ? res.value : null;
      console.log('browserId: ', id);
      // create a random ID for this browser if one doesn't exist
      // browser id is used with the sockets to determine if we need
      // to send the user buffered events or not
      if (!id) {
        console.log('no browser ID creating');
        id = Math.random()
          .toString(36)
          .substring(2, 15);
        console.log('putting browser ID into db', id);
        await db.prefs.put({
          key: 'browser-id',
          value: id
        });
      }
      return id;
    })
      .then(browserId => {
        return { browserId };
      })
      .catch(err => {
        console.error(err);
        let unsupported = ['indexDB'];
        return { unsupported };
      })
      .then(({ browserId, unsupported = [] }) => {
        console.log('browser all good', browserId, unsupported);
        if (unsupported.length) {
          console.warn(`browser does not support ${unsupported.join(', ')}`);
          return false;
        }
        setState({ browserId, testingBrowser: false });
      });
  }, [db]);

  return state;
}
