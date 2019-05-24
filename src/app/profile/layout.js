import './layout.module.scss';

import {
  BellIcon,
  CreditCardIcon,
  HeartIcon,
  LinkIcon,
  LockIcon,
  MailIcon,
  SettingsIcon,
  UserIcon
} from '../../components/icons';

import { Link } from 'gatsby';
import React from 'react';
import Template from '../template';

export default ({ pageName, children }) => (
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
                <UserIcon width="16" height="16" /> Profile
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/accounts"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <LinkIcon width="16" height="16" /> Accounts
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/security"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <LockIcon width="16" height="16" />
                Security
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/billing"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <CreditCardIcon width="16" height="16" /> Billing
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/scans"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <MailIcon width="16" height="16" /> Scan history
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/activity"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <MailIcon width="16" height="16" /> Activity history
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/notifications"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <BellIcon width="16" height="16" /> Notifications
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/ignore"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <HeartIcon width="16" height="16" /> Favorite senders
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/preferences"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <SettingsIcon width="16" height="16" /> Preferences
              </Link>
            </li>
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
