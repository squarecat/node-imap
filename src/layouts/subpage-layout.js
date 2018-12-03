import React from 'react';
import Layout from '../layouts/layout';
import logo from '../assets/transparent-logo.png';
import './subpage-layout.css';

export default ({ children }) => {
  return (
    <Layout>
      <div className="subpage-header">
        <a href="/" className="subpage-header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="subpage-header-title">Leave Me Alone </div>
      </div>
      <div className="subpage">
        <div className="subpage-content">{children}</div>
      </div>
    </Layout>
  );
};
