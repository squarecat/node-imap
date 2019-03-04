import 'babel-polyfill';
import '../common.scss';
import './layout.css';

import Helmet from 'react-helmet';
import React from 'react';
import favicon from '../assets/meta/favicon.png';
import { setConfig } from 'react-hot-loader';

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
        link={[{ rel: 'icon', type: 'image/png', href: favicon }]}
      />
      {children}
    </>
  );
};

export default AppLayout;
