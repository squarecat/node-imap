import React from 'react';
import cx from 'classnames';

import Layout from '../layouts/layout';
import Footer from '../components/footer';
import Header from '../pages/header';

import './subpage-layout.module.scss';

export default ({ title, description, children, ...visProps }) => {
  const classes = cx('subpage', {
    centered: visProps.centered
  });
  return (
    <Layout title={title} description={description}>
      <Header inverted />
      <div styleName={classes}>
        <div styleName="subpage-content">{children}</div>
        <Footer subpage />
      </div>
    </Layout>
  );
};
