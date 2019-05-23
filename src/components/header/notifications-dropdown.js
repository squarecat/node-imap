import './notifications-dropdown.module.scss';

import React, { useEffect, useState } from 'react';

import { BellIcon } from '../../components/icons';
import Button from '../../components/btn';
import { Link } from 'gatsby';

// import useUser from '../../utils/hooks/use-user';

export default () => {
  const [showSettings, setShowSettings] = useState(false);
  // const [{ profileImg, email }] = useUser(({ profileImg, email }) => ({
  //   profileImg,
  //   email
  // }));

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    if (!parentElement) return;
    while (parentElement && parentElement !== document.body) {
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

  const accountLetter = email.length ? email[0] : '';
  return (
    <div styleName="settings-dropdown">
      <Button
        compact
        styleName={`settings-dropdown-toggle ${showSettings ? 'shown' : ''}`}
        onClick={() => setShowSettings(!showSettings)}
      >
        <div styleName="notification-icon">
          <BellIcon />
        </div>
      </Button>
      <ul styleName={`settings-dropdown-list ${showSettings ? 'shown' : ''}`}>
        <li>
          <Link to="/app/profile">Settings</Link>
        </li>
        <li>
          <Link to="/app/profile/accounts">Connect account</Link>
        </li>
        <li>
          <Link to="/app/profile/billing">Billing</Link>
        </li>
        <li>
          <Link to="/app/profile/security">Security</Link>
        </li>
        <li>
          <Link to="/app/profile/notifications">Notifications</Link>
        </li>

        <li styleName="logout">
          <a href="/auth/logout">Logout</a>
        </li>
      </ul>
    </div>
  );
};
