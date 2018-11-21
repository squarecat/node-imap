import React, { Suspense } from 'react';
import { fetchLoggedInUser } from '../utils/auth';
import { useAsync } from '../utils/hooks';
import './auth.css';
import gmailLogo from '../assets/gmail.png';

export default ({ children }) => {
  const { error, value: isLoggedIn, loading } = useAsync(
    fetchLoggedInUser,
    [],
    { minWait: 2000 }
  );

  if (!loading && !isLoggedIn) {
    return (window.location.pathname = '/login');
  }

  return (
    <div className={`auth-loading ${loading ? '' : 'auth-loading--loaded'}`}>
      <div className="dice">
        <div className="auth-loading-pane auth-loading-pane--front">
          <span className="logo-emoji">🙅‍♀️</span>
        </div>
        <div className="auth-loading-pane auth-loading-pane--back">
          <img src={gmailLogo} alt="gmail-logo" />
        </div>
      </div>
      <div className="loaded-content">{!loading ? children : null}</div>
    </div>
  );
};
