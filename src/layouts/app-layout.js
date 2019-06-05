import '@babel/polyfill';
import '../common.scss';
import './layout.css';

import { AlertProvider } from '../app/alert-provider';
import { DatabaseProvider } from '../app/db-provider';
import Helmet from 'react-helmet';
import React from 'react';
import { setConfig } from 'react-hot-loader';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;

setConfig({ pureSFC: true });

const AppLayout = ({ pageName, children }) => {
  return (
    <>
      <Helmet
        title={`${pageName || 'Home'} | Leave Me Alone`}
        lang="en"
        meta={[
          {
            name: 'charSet',
            content: 'utf-8'
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0'
          }
        ]}
        link={[{ rel: 'icon', type: 'image/png', href: faviconUrl }]}
        script={[{ src: 'https://checkout.stripe.com/checkout.js' }]}
      />
      <DatabaseProvider>
        <AlertProvider>{children}</AlertProvider>
      </DatabaseProvider>
    </>
  );
};

export default AppLayout;
