import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';

const GoodbyePage = () => {
  return (
    <SubPageLayout
      title="Goodbye"
      slug="/goodbye"
      description={`Thank you for using Leave Me Alone. We have deleted all of your data and revoked any API keys attached to your account. `}
      centered
    >
      <h1>Goodbye 👋</h1>
      <p>Thank you for using Leave Me Alone!</p>
      <p>
        We have deleted <TextImportant>ALL OF YOUR DATA</TextImportant> from our
        systems and revoked any API keys attached to your account.
      </p>
      <p>
        You are not tied to our service in any way. Any mailing lists you
        unsubscribed from are gone forever.
      </p>
      <p>Thank you for being a loyal customer.</p>
      <p>💌</p>
      <p>- James & Danielle</p>
    </SubPageLayout>
  );
};

export default GoodbyePage;
