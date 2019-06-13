import './header.module.scss';

import Credits from './credits';
import { Link } from 'gatsby';
import NotificationsDropdown from './notifications';
import React from 'react';
import SettingsDropdown from './settings';
import useUser from '../../utils/hooks/use-user';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default ({ loaded }) => {
  const [{ organisationId }] = useUser(({ organisationId }) => ({
    organisationId
  }));
  return (
    <div styleName={`header ${loaded ? 'loaded' : ''}`}>
      <Link to="/login/" styleName="header-logo">
        <img alt="Leave Me Alone logo" src={logoUrl} />
      </Link>
      <div styleName="header-title">Leave Me Alone </div>
      <div styleName="header-actions">
        {organisationId ? null : <Credits />}
        <NotificationsDropdown />
        <SettingsDropdown />
      </div>
    </div>
  );
};
