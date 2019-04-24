import './header.module.scss';

import React from 'react';
import { TextLink } from '../components/text';
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
      <a href="/" styleName="header-logo">
        <img alt="logo" src={logoUrl} />
      </a>
      <div styleName="header-title">Leave Me Alone </div>
      <ul styleName="header-nav">
        <li styleName="nav-link nav-how">
          <TextLink href="/#learn">How it works</TextLink>
        </li>
        <li styleName="nav-link">
          <TextLink href="/#pricing">Pricing</TextLink>
        </li>
        <li styleName="nav-login">
          <a
            href="/app"
            onMouseEnter={() => setActive(true)}
            onMouseLeave={() => setActive(false)}
            styleName="login-btn"
          >
            Log in
          </a>
        </li>
      </ul>
    </div>
  </div>
);
