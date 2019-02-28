import React from 'react';
import cx from 'classnames';

import Layout from '../layouts/layout';
import Footer from '../components/footer';
import Header from '../pages/header';

import './subpage-layout.module.scss';

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
