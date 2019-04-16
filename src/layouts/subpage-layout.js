import './subpage-layout.module.scss';

import Footer from '../components/footer';
import Header from '../components/landing/header';
import Layout from '../layouts/layout';
import React from 'react';
import cx from 'classnames';

export default ({ page, children, ...visProps }) => {
  const classes = cx('subpage', {
    centered: visProps.centered
  });
  return (
    <Layout page={page}>
      <Header inverted />
      <div styleName={classes}>
        <div styleName="subpage-content">{children}</div>
        <Footer subpage />
      </div>
    </Layout>
  );
};
