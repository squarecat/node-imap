import Footer from '../components/footer';
import Header from '../components/landing/header';
import Layout from '../layouts/layout';
import React from 'react';
import cx from 'classnames';
import styles from './subpage-layout.module.scss';

export default ({
  title,
  description,
  slug,
  children,
  withContent = true,
  ...visProps
}) => {
  const classes = cx(styles.subpage, {
    [styles.centered]: visProps.centered
  });
  return (
    <Layout title={title} description={description} slug={slug}>
      <Header inverted />
      <div className={classes}>
        {withContent ? (
          <div styleName="subpage-content">{children}</div>
        ) : (
          <div>{children}</div>
        )}
      </div>
      <Footer subpage />
    </Layout>
  );
};

export function SubpageTagline({ children }) {
  return <p styleName="subpage-tagline">{children}</p>;
}
