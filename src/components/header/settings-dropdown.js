import './settings-dropdown.module.scss';

import React, { useEffect, useState } from 'react';

import Button from '../../components/btn';
import { Link } from 'gatsby';
import useUser from '../../utils/hooks/use-user';

export default () => {
  const [showSettings, setShowSettings] = useState(false);
  const [{ profileImg, email }] = useUser(({ profileImg, email }) => ({
    profileImg,
    email
  }));

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
        <div styleName="profile">
          {profileImg ? (
            <img styleName="profile-img" src={profileImg} />
          ) : (
            <span styleName="profile-text">{accountLetter}</span>
          )}
        </div>
      </Button>
      <ul styleName={`settings-dropdown-list ${showSettings ? 'shown' : ''}`}>
        <li>
          <Link to="/app/profile">Account settings</Link>
        </li>
        <li>
          <a href="/login">Switch account</a>
        </li>
        <li styleName="logout">
          <a href="/auth/logout">Logout</a>
        </li>
      </ul>
    </div>
  );
};
