import './header.module.scss';

import Credits from './credits';
import { Link } from 'gatsby';
import NotificationsDropdown from './notifications';
import React from 'react';
import Reminder from './reminder';
import SettingsDropdown from './settings';
import useUser from '../../utils/hooks/use-user';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default ({ loaded }) => {
  const [{ organisationId }] = useUser(({ organisationId }) => ({
    organisationId
  }));

  return (
    <div styleName={`header ${loaded ? 'loaded' : ''}`}>
      <Link to="/app" styleName="header-logo">
        <img alt="Leave Me Alone logo" src={logoUrl} />
        <span styleName="header-title">Leave Me Alone</span>
      </Link>
      <div styleName="header-actions">
        <Reminder />
        {organisationId ? null : <Credits />}
        <NotificationsDropdown />
        <SettingsDropdown />
      </div>
    </div>
  );
};
