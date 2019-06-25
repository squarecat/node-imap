import '@babel/polyfill';
import '../common.scss';
import './layout.css';

import React, { useEffect } from 'react';

import { AlertProvider } from '../providers/alert-provider';
import { DatabaseProvider } from '../providers/db-provider';
import Helmet from 'react-helmet';
import { ModalProvider } from '../providers/modal-provider';
import { setConfig } from 'react-hot-loader';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;

setConfig({ pureSFC: true });

const AppLayout = ({ pageName, children }) => {
  useEffect(() => {
    if (window.intergram && window.intergram.hide) {
      window.intergram.hide();
    }
  }, []);
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
      />

      <DatabaseProvider>
        <AlertProvider>
          <ModalProvider>{children}</ModalProvider>
        </AlertProvider>
      </DatabaseProvider>
    </>
  );
};

export default AppLayout;
