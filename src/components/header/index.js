import './header.module.scss';

import React, { useMemo } from 'react';

import Credits from './credits';
import { Link } from 'gatsby';
import Reminder from './reminder';
import SettingsDropdown from './settings';
import logo from '../../assets/logo.png';
import useUser from '../../utils/hooks/use-user';

const Header = React.memo(({ loaded }) => {
  const [{ hasOrganisation, isUserLoaded }] = useUser(u => ({
    hasOrganisation: !!u.organisationId,
    isUserLoaded: u.loaded
  }));

  const content = useMemo(() => {
    if (!isUserLoaded) {
      return null;
    }
    return (
      <>
        <Reminder />
        {hasOrganisation ? null : <Credits />}
        <SettingsDropdown />
      </>
    );
  }, [isUserLoaded, hasOrganisation]);

  return (
    <div styleName={`header ${loaded ? 'loaded' : ''}`}>
      <Link to="/app" styleName="header-logo">
        <img alt="Leave Me Alone logo" src={logo} />
        <span styleName="header-title">Leave Me Alone</span>
      </Link>
      <div styleName="header-actions">{content}</div>
    </div>
  );
});

export default Header;
