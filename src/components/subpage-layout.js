import React from 'react';
import Layout from './layout';
import logo from '../assets/transparent-logo.png';
import './subpage-layout.css';

export default ({ children }) => {
  return (
    <Layout>
      <div className="header">
        <a href="/app" className="header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="header-title">Leave Me Alone </div>
      </div>
      <div className="subpage">
        <div className="subpage-content">{children}</div>
      </div>
    </Layout>
  );
};
