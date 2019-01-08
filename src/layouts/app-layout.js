import { setConfig } from 'react-hot-loader';
import 'babel-polyfill';
import React from 'react';
import Helmet from 'react-helmet';

import favicon from '../assets/meta/favicon.png';

import '../common.css';
import './layout.css';

setConfig({ pureSFC: true });

const AppLayout = ({ children }) => {
  return (
    <>
      <Helmet
        title="Home | Leave Me Alone"
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
