import React from 'react';
import { Link } from 'gatsby';
import Template from '../template';

import {
  SettingsIcon,
  MailIcon,
  CreditCardIcon,
  HeartIcon
} from '../../../components/icons';

import './layout.module.scss';

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
                <SettingsIcon />
                Account
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/billing"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <CreditCardIcon />
                Billing
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/scans"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <MailIcon />
                Scan History
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/ignore"
                styleName="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <HeartIcon />
                Favorite senders
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
