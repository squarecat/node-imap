import './settings-dropdown.module.scss';

import React, { useEffect, useState } from 'react';

import Button from '../../components/btn';
import { Link } from 'gatsby';

export default ({ profileImg, onClickSupport }) => {
  const [showSettings, setShowSettings] = useState(false);

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
    <div styleName="settings-dropdown">
      <Button
        compact
        styleName={`settings-dropdown-toggle ${showSettings ? 'shown' : ''}`}
        onClick={() => setShowSettings(!showSettings)}
      >
        <div styleName="profile">
          <img styleName="profile-img" src={profileImg} />
        </div>
      </Button>
      <ul styleName={`settings-dropdown-list ${showSettings ? 'shown' : ''}`}>
        <li>
          <Link to="/app/profile">Account settings</Link>
        </li>
        <li>
          <a href="/auth/google">Switch account</a>
        </li>
        <li styleName="support">
          <a href="#" onClick={() => onClickSupport()}>
            Get help
          </a>
        </li>
        <li styleName="logout">
          <a href="/auth/logout">Logout</a>
        </li>
      </ul>
    </div>
  );
};
