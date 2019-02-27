import './header.module.scss';

import React from 'react';
import { TextLink } from '../components/text';
import smallLogo from '../assets/envelope-logo.png';

export default ({ setActive }) => (
  <div styleName="header">
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
        <img alt="logo" src={smallLogo} />
      </a>
      <div styleName="header-title">Leave Me Alone </div>
      <ul styleName="header-nav">
        <li styleName="nav-link">
          <TextLink href="#how-it-works">How it works</TextLink>
        </li>
        <li styleName="nav-link">
          <TextLink href="#pricing">Pricing</TextLink>
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
