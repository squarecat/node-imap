import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';

import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import Button from '../../components/btn';
import logo from '../../assets/envelope-logo.png';
import useUser from '../../utils/hooks/use-user';

export default ({ children }) => {
  const [user] = useUser();
  const [showSettings, setShowSettings] = useState();
  const { profileImg } = user;

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    while (parentElement !== document.body) {
      if (parentElement.classList.contains('settings-dropdown-toggle')) {
        return;
      }
      parentElement = parentElement.parentElement;
    }
    setShowSettings(false);
  };
  useEffect(
    () => {
      if (showSettings) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
    },
    [showSettings]
  );

  return (
    <AppLayout>
      <Auth loaded={!!user}>
        <div className="header">
          <Link to="/app/" className="header-logo">
            <img alt="logo" src={logo} />
          </Link>
          <div className="header-title">Leave Me Alone </div>

          <div className="settings-dropdown">
            <Button
              compact
              className={`settings-dropdown-toggle ${
                showSettings ? 'shown' : ''
              }`}
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="profile">
                <img className="profile-img" src={profileImg} />
              </div>
            </Button>
            <ul
              className={`settings-dropdown-list ${
                showSettings ? 'shown' : ''
              }`}
            >
              <li>
                <a href="/auth/google">Switch account</a>
              </li>
              <li>
                <Link to="/app/history/scans">Scan history</Link>
              </li>
              {/* <li>
                <Link to="/app/history/unsubscriptions">Unsub history</Link>
              </li> */}
              <li className="logout">
                <a href="/auth/logout">Logout</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="app-content">{children}</div>
      </Auth>
    </AppLayout>
  );
};
