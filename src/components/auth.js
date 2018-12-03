import React, { useEffect } from 'react';

import { fetchLoggedInUser, isPaymentRedirect } from '../utils/auth';
import { useAsync, useGlobal } from '../utils/hooks';
import './auth.css';
import gmailLogo from '../assets/gmail.png';
import girlLogo from '../assets/leavemealonegirl.png';

export default ({ children }) => {
  debugger;
  const { error, value: user, loading } = useAsync(fetchLoggedInUser, [], {
    minWait: isPaymentRedirect() ? 0 : 2000
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
  const [user, setUser] = useGlobal('user');

  useEffect(() => {
    if (newUser && !user) {
      setUser({ ...newUser, hasSearched: newUser.hasScanned });
    }
  });

  return (
    <div
      className={`auth-loading ${
        loading || !user ? '' : 'auth-loading--loaded'
      }`}
    >
      <div className="dice">
        <div className="auth-loading-pane auth-loading-pane--front">
          <span className="logo-emoji">
            <img src={girlLogo} alt="girl-logo" className="girl-logo" />
          </span>
        </div>
        <div className="auth-loading-pane auth-loading-pane--back">
          <img src={gmailLogo} alt="gmail-logo" className="gmail-logo" />
        </div>
      </div>
      <div className="loaded-content">{!loading && user ? children : null}</div>
    </div>
  );
}
