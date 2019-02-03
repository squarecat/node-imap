import React from 'react';
import { Link } from 'gatsby';
import Template from '../template';

import IgnoreIcon from '../../../components/ignore-icon';

import './profile.css';

export default ({ pageName, children }) => (
  <Template pageName={pageName}>
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-nav-container">
          <p className="profile-back">
            <Link to="/app">&lt; Back to scan</Link>
          </p>
          <ul className="profile-nav">
            <li>
              <Link
                to="/app/profile"
                className="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                Account
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/history/scans"
                className="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                Scan History
              </Link>
            </li>
            <li>
              <Link
                to="/app/profile/ignore"
                className="profile-nav-link"
                activeClassName="profile-nav-link--active"
              >
                <IgnoreIcon ignored={true} />
                Favorite senders
              </Link>
            </li>
          </ul>
        </div>
        <div className="profile-content">
          <h1 className="profile-title">{pageName}</h1>
          {children}
        </div>
      </div>
    </div>
  </Template>
);
