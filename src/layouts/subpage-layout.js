import React from 'react';
import cx from 'classnames';

import Layout from '../layouts/layout';
import logo from '../assets/envelope-logo.png';
import Footer from '../components/footer';

import './subpage-layout.css';

export default ({ page, className, children, centered }) => {
  const classes = cx('subpage', {
    'subpage-centered': centered,
    [className]: className
  });
  return (
    <Layout page={page}>
      <div className="subpage-header">
        <a href="/" className="subpage-header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="subpage-header-title">Leave Me Alone </div>
        <ul className="home-header-nav subpage-header-nav">
          <li className="nav-how">
            <a className="link" href="/#how-it-works">
              How it works
            </a>
          </li>
          <li className="nav-pricing">
            <a className="link" href="/#pricing">
              Pricing
            </a>
          </li>
          <li className="nav-login">
            <a href="/app" className="subpage-header-btn">
              Log in
            </a>
          </li>
        </ul>
      </div>
      <div className={classes}>
        <div className="subpage-content">{children}</div>
        <Footer />
      </div>
    </Layout>
  );
};
