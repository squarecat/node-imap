import './header.module.scss';

import { Link } from 'gatsby';
import React from 'react';
import { TextLink } from '../../text';
import cx from 'classnames';

const logoUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

export default ({ setActive = () => {}, inverted = false }) => (
  <div styleName={cx('header', { 'header-inverted': inverted })}>
    {/* <div styleName="ref-banner">
      {bannerShown ? (
        <span>
          ❤ Happy Valentines Day! Today only have 40% off all{' '}
          <a href="/gifts">gift purchases</a> ❤
        </span>
      ) : null}
    </div> */}
    <div styleName="header-inner">
      <Link to="/" styleName="header-logo">
        <img alt="Leave Me Alone logo" src={logoUrl} />
      </Link>
      <div styleName="header-title">Leave Me Alone </div>
      <ul styleName="header-nav">
        <li styleName="nav-link nav-how">
          <Link to="/learn">How it works</Link>
        </li>
        <li styleName="nav-link">
          <Link to="/pricing">Pricing</Link>
        </li>
        <li styleName="nav-link">
          <Link to="/about">About</Link>
        </li>
        <li styleName="nav-link">
          <Link to="/login">Log in</Link>
        </li>
        <li styleName="nav-btn">
          <Link
            to="/signup"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            styleName="login-btn"
          >
            Sign up
          </Link>
        </li>
      </ul>
    </div>
  </div>
);
