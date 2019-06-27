import './layout.module.scss';

import {
  BellIcon,
  CreditCardIcon,
  HeartIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  SettingsIcon,
  UserIcon,
  WorkIcon
} from '../../components/icons';

import { Link } from 'gatsby';
import React from 'react';
import Template from '../template';
import useUser from '../../utils/hooks/use-user';

export default ({ pageName, children }) => {
  const [{ organisationId }] = useUser(u => ({
    organisationId: u.organisationId
  }));

  return (
    <Template pageName={pageName}>
      <div styleName="profile-page">
        <div styleName="profile-container">
          <div styleName="profile-nav-container">
            <p styleName="profile-back">
              <Link to="/app">&lt; Back to scan</Link>
            </p>
            <ul styleName="profile-nav">
              <li>
                <Link
                  to="/app/profile"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <UserIcon width="16" height="16" />
                  <span>Profile</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/app/profile/accounts"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <LinkIcon width="16" height="16" />
                  <span>Accounts</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/app/profile/security"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <LockIcon width="16" height="16" />
                  <span> Security</span>
                </Link>
              </li>
              {organisationId ? null : (
                <li>
                  <Link
                    to="/app/profile/billing"
                    styleName="profile-nav-link"
                    activeClassName="profile-nav-link--active"
                  >
                    <CreditCardIcon width="16" height="16" />
                    <span>Billing</span>
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/app/profile/history/activity"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <MailIcon width="16" height="16" />
                  <span>Activity history</span>
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/app/profile/history/notifications"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <BellIcon width="16" height="16" />
                  <span>Notifications</span>
                </Link>
              </li> */}
              <li>
                <Link
                  to="/app/profile/ignore"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <HeartIcon width="16" height="16" />
                  <span>Favorite senders</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/app/profile/preferences"
                  styleName="profile-nav-link"
                  activeClassName="profile-nav-link--active"
                >
                  <SettingsIcon width="16" height="16" />
                  <span>Preferences</span>
                </Link>
              </li>
              {organisationId ? (
                <li>
                  <Link
                    to="/app/profile/organisation"
                    styleName="profile-nav-link"
                    activeClassName="profile-nav-link--active"
                  >
                    <WorkIcon width="16" height="16" />
                    <span>Organisation</span>
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
          <div styleName="profile-content">
            <h1 styleName="profile-title">{pageName}</h1>
            {children}
          </div>
        </div>
      </div>
    </Template>
  );
};
