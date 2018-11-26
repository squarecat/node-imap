import { setConfig } from 'react-hot-loader';
import 'babel-polyfill';
import React from 'react';
import Helmet from 'react-helmet';

import './layout.css';

setConfig({ pureSFC: true });

const AppLayout = ({ children }) => (
  <>
    <Helmet
      title=""
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' }
      ]}
    >
      <html lang="en" />
    </Helmet>
    {children}
  </>
);

export default AppLayout;
