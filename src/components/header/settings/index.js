import './settings.module.scss';

import React, { useEffect, useState } from 'react';

import Button from '../../../components/btn';
import { Link } from 'gatsby';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [showSettings, setShowSettings] = useState(false);
  const [{ profileImg, email, organisationId }] = useUser(
    ({ profileImg, email, organisationId }) => ({
      profileImg,
      email,
      organisationId
    })
  );

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
        <li styleName="setting-item">
          <Link styleName="setting-item-link" to="/app/profile">
            Settings
          </Link>
        </li>
        {organisationId ? null : (
          <li styleName="setting-item">
            <Link styleName="setting-item-link" to="/app/profile/accounts">
              Connect account
            </Link>
          </li>
        )}
        <li styleName="setting-item">
          <Link styleName="setting-item-link" to="/app/profile/billing">
            Billing
          </Link>
        </li>
        <li styleName="setting-item">
          <Link styleName="setting-item-link" to="/app/profile/security">
            Security
          </Link>
        </li>
        <li styleName="setting-item">
          <Link
            styleName="setting-item-link"
            to="/app/profile/history/notifications"
          >
            Notifications
          </Link>
        </li>
        {organisationId ? (
          <li styleName="setting-item">
            <Link styleName="setting-item-link" to="/app/profile/organisation">
              Organisation
            </Link>
          </li>
        ) : null}
        <li styleName="setting-item logout">
          <a styleName="setting-item-link" href="/logout">
            Logout
          </a>
        </li>
      </ul>
    </div>
  );
};
