import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

const NotFoundPage = () => (
  <SubPageLayout className="not-found-page">
    <h1>404</h1>
    <h2>Nothing Found Here</h2>
    <p>You're not going to get a cleaner inbox out in the wild like this!</p>
    <a href="/">Back home</a>
  </SubPageLayout>
);

export default NotFoundPage;
