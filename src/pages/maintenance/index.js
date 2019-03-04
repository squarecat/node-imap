import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';

const NotFoundPage = () => (
  <SubPageLayout page="Maintenance" centered>
    <h1>Down for maintenance</h1>
    <h2>We're improving Leave Me Alone!</h2>
    <p>
      We're currently upgrading the Leave Me Alone system, check back in a
      little while for the updates!
    </p>
    <p>
      We'll post about our progress and updates on our Twitter page{' '}
      <a href="https://twitter.com/LeaveMeAloneApp">
        https://twitter.com/LeaveMeAloneApp
      </a>
      .
    </p>
    <TextLink href="/">Back home</TextLink>
  </SubPageLayout>
);

export default NotFoundPage;
