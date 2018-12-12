import React from 'react';
import Layout from '../layouts/layout';
import logo from '../assets/envelope-logo.png';
import Footer from '../components/footer';

import './subpage-layout.css';

export default ({ page, className, children }) => {
  return (
    <Layout page={page}>
      <div className="subpage-header">
        <a href="/" className="subpage-header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="subpage-header-title">Leave Me Alone </div>
      </div>
      <div className={`subpage ${className}`}>
        <div className="subpage-content">{children}</div>
        <Footer />
      </div>
    </Layout>
  );
};
