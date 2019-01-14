import React, { useState, useEffect } from 'react';
import { Link } from 'gatsby';

import ReferralModal from '../../components/referral-modal';
import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import Button from '../../components/btn';
import IgnoreIcon from '../../components/ignore-icon';
import logo from '../../assets/envelope-logo.png';
import useUser from '../../utils/hooks/use-user';

export default ({ children }) => {
  const [user] = useUser();
  const [showSettings, setShowSettings] = useState(false);
  const { profileImg } = user;
  const [showReferrerModal, toggleReferrerModal] = useState(false);

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    if (!parentElement) return;
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
      return () => document.body.removeEventListener('click', onClickBody);
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
          <div className="header-actions">
            {user.beta ? (
              <Button
                className="refer-btn"
                basic
                compact
                onClick={() => toggleReferrerModal(true)}
              >
                Refer a friend
              </Button>
            ) : null}
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
                <li>
                  <Link to="/app/ignore">
                    <IgnoreIcon ignored={true} />
                    Ignored senders
                  </Link>
                </li>
                <li className="support">
                  <a href="#" onClick={() => openChat()}>
                    Get help
                  </a>
                </li>
                <li className="logout">
                  <a href="/auth/logout">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="app-content">{children}</div>
        {showReferrerModal ? (
          <ReferralModal onClose={() => toggleReferrerModal(false)} />
        ) : null}
      </Auth>
    </AppLayout>
  );
};

function openChat(message = '') {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:show']);
    window.$crisp.push(['do', 'chat:open']);
    window.$crisp.push(['set', 'message:text', [message]]);
    window.$crisp.push(['on', 'chat:closed', closeChat]);
  }
}

function closeChat() {
  if (window.$crisp) {
    window.$crisp.push(['do', 'chat:hide']);
  }
}
