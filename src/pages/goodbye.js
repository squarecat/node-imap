import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

const GoodbyePage = () => {
  return (
    <SubPageLayout page="Goodbye" centered>
      <h1>Goodbye 👋</h1>
      <p>Thank you for using Leave Me Alone!</p>
      <p>
        We have deleted <span className="text-important">ALL OF YOUR DATA</span>{' '}
        and revoked your API key.
      </p>
      <p>
        You are not tied to our service in any way. Any spam email lists you
        unsubscribed from are gone forever.
      </p>
    </SubPageLayout>
  );
};

export default GoodbyePage;
