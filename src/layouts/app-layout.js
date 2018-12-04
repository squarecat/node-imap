import { setConfig } from 'react-hot-loader';
import 'babel-polyfill';
import React from 'react';
import Helmet from 'react-helmet';

import favicon from '../assets/meta/favicon.png';

import '../common.css';
import './layout.css';

setConfig({ pureSFC: true });

const AppLayout = ({ children }) => (
  <>
    <Helmet>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Home | Leave Me Alone</title>
      <html lang="en" />
      <link rel="shortcut icon" type="image/png" href={favicon} />
    </Helmet>
    {children}
  </>
);

export default AppLayout;
