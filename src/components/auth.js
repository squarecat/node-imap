import React, { useEffect } from 'react';

import { fetchLoggedInUser, isOriginalLoad } from '../utils/auth';
import { useAsync } from '../utils/hooks';
import useUser from '../utils/hooks/use-user';
import './auth.css';
import envelopeLogo from '../assets/envelope.png';
import girlLogo from '../assets/leavemealonegirl.png';

export default ({ children, loaded }) => {
  const { error, value: user, loading } = useAsync(fetchLoggedInUser, [], {
    minWait: loaded ? 0 : 2000
  });
  if (!loading && !user) {
    return (window.location.pathname = '/login');
  }
  if (error) {
    return <span>{error}</span>;
  }
  return (
    <UserAuth user={user} loading={loading}>
      {children}
    </UserAuth>
  );
};

function UserAuth({ user: newUser, children, loading }) {
  const [isUserLoaded, { load }] = useUser(s => s.loaded);

  useEffect(() => {
    if (newUser && !isUserLoaded) {
      load({ ...newUser, hasSearched: newUser.hasScanned });
    }
  });

  return (
    <div
      className={`auth-loading ${
        loading || !isUserLoaded ? '' : 'auth-loading--loaded'
      }`}
    >
      <div className="dice">
        <div className="auth-loading-pane auth-loading-pane--front">
          <img src={girlLogo} alt="girl-logo" className="girl-logo" />
        </div>
        <div className="auth-loading-pane auth-loading-pane--back">
          <img
            src={envelopeLogo}
            alt="envelope-logo"
            className="envelope-logo"
          />
        </div>
      </div>
      <div className="loaded-content">
        {!loading && isUserLoaded ? children : null}
      </div>
    </div>
  );
}
