import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

import './404.css';

const NotFoundPage = () => (
  <SubPageLayout page="Not Found" className="not-found-page">
    <h1>404</h1>
    <h2>Nothing Found Here</h2>
    <p>You're not going to get a cleaner inbox out in the wild like this!</p>
    <a className="link" href="/">
      Back home
    </a>
  </SubPageLayout>
);

export default NotFoundPage;
