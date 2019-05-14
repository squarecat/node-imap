import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';

const GoodbyePage = () => {
  return (
    <SubPageLayout title="Goodbye" centered>
      <h1>Goodbye 👋</h1>
      <p>Thank you for using Leave Me Alone!</p>
      <p>
        We have deleted <TextImportant>ALL OF YOUR DATA</TextImportant> and
        revoked your API key.
      </p>
      <p>
        You are not tied to our service in any way. Any mailing lists you
        unsubscribed from are gone forever.
      </p>
    </SubPageLayout>
  );
};

export default GoodbyePage;
