import './404.module.scss';

import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';

const NotFoundPage = () => (
  <SubPageLayout page="Not Found" centered>
    <h1>404</h1>
    <h2>Nothing Found Here</h2>
    <p>You're not going to get a cleaner inbox out in the wild like this!</p>
    <TextLink href="/">Back home</TextLink>
  </SubPageLayout>
);

export default NotFoundPage;
