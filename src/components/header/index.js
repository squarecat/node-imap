import './header.module.scss';

import React, { useMemo } from 'react';

import Credits from './credits';
import { Link } from 'gatsby';
import NotificationsDropdown from './notifications';
import Reminder from './reminder';
import SettingsDropdown from './settings';
import useUser from '../../utils/hooks/use-user';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

const Header = React.memo(({ loaded }) => {
  const [organisationId] = useUser(({ organisationId }) => organisationId);

  const CreditsContent = useMemo(
    () => {
      if (organisationId) return null;
      return <Credits />;
    },
    [organisationId]
  );

  console.log('render header');
  return (
    <div styleName={`header ${loaded ? 'loaded' : ''}`}>
      <Link to="/app" styleName="header-logo">
        <img alt="Leave Me Alone logo" src={logoUrl} />
        <span styleName="header-title">Leave Me Alone</span>
      </Link>
      <div styleName="header-actions">
        <Reminder />
        {CreditsContent}
        <NotificationsDropdown />
        <SettingsDropdown />
      </div>
    </div>
  );
});

Header.whyDidYouRender = true;

export default Header;
