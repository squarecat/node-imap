import './header.module.scss';

import Dropdown, {
  DropdownItem,
  DropdownList
} from '../../../components/dropdown';

import { Link } from 'gatsby';
import React from 'react';
import cx from 'classnames';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default ({ setActive = () => {}, inverted = false }) => (
  <div
    styleName={cx('landing-header', { 'landing-header-inverted': inverted })}
  >
    {/* <div styleName="ref-banner">
      {bannerShown ? (
        <span>
          ❤ Happy Valentines Day! Today only have 40% off all{' '}
          <a href="/gifts">gift purchases</a> ❤
        </span>
      ) : null}
    </div> */}
    <div styleName="landing-header-inner">
      <Link to="/" styleName="landing-header-logo">
        <img alt="Leave Me Alone logo" src={logoUrl} />
        <span styleName="landing-header-title">Leave Me Alone</span>
      </Link>
      <ul styleName="nav">
        <li styleName="nav-link nav-how">
          <Link to="/learn">How it works</Link>
        </li>
        <li styleName="nav-link nav-pricing">
          <Link to="/pricing">Pricing</Link>
        </li>
        <li styleName="nav-link nav-about">
          <Link to="/about">About</Link>
        </li>
        <li styleName="nav-link nav-login">
          <Link to="/login">Log in</Link>
        </li>
        <MoreDropdown />
        <li styleName="nav-btn">
          <Link
            to="/signup"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            styleName="signup-btn"
          >
            Sign up
          </Link>
        </li>
      </ul>
    </div>
  </div>
);

function MoreDropdown() {
  return (
    <Dropdown
      toggleBtn={
        <li styleName="nav-link nav-more">
          <a>More</a>
        </li>
      }
    >
      <DropdownList>
        <DropdownItem>
          <Link to="/learn">How it works</Link>
        </DropdownItem>
        <DropdownItem>
          <Link to="/pricing">Pricing</Link>
        </DropdownItem>
        <DropdownItem>
          <Link to="/about">About</Link>
        </DropdownItem>
        <DropdownItem separated>
          <Link to="/login">Log in</Link>
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
}
