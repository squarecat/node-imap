import './header.module.scss';

import Dropdown, {
  DropdownItem,
  DropdownList
} from '../../../components/dropdown';
import React, { useRef } from 'react';

import { Link } from 'gatsby';
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
        <LearnMoreDropdown />
        <li styleName="nav-link nav-extra">
          <Link to="/pricing">Pricing</Link>
        </li>
        <li styleName="nav-link nav-extra">
          <Link to="/enterprise">Enterprise</Link>
        </li>
        <li styleName="nav-link nav-extra">
          <Link to="/login">Log in</Link>
        </li>
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

function LearnMoreDropdown() {
  return (
    <li styleName="nav-link">
      <Dropdown toggleBtn={<a>Learn more</a>} toggleEvent="hover">
        <DropdownList>
          <DropdownItem>
            <Link to="/learn">How it works</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/security">Security</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/about">About us</Link>
          </DropdownItem>
          <DropdownItem>
            <Link to="/faq">FAQ</Link>
          </DropdownItem>

          <div styleName="learn-more-extras">
            <DropdownItem>
              <Link to="/pricing">Pricing</Link>
            </DropdownItem>
            <DropdownItem>
              <Link to="/enterprise">Enterprise</Link>
            </DropdownItem>
            <DropdownItem separated>
              <Link to="/login">Log in</Link>
            </DropdownItem>
          </div>
        </DropdownList>
      </Dropdown>
    </li>
  );
}
