import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

import GiftsPayment from '../components/gifts/gifts';
import { PRICES } from '../components/price-modal';

const GiftsPage = () => {
  return (
    <SubPageLayout page="Gift a scan" centered>
      <h1>Gift a clean inbox</h1>
      <span className="subpage-section-emoji">🎁</span>
      <p>
        Increase your{' '}
        <span className="text-important">team's productivity</span>.
      </p>
      <p>
        Give your loved one{' '}
        <span className="text-important">fewer email notifications</span>.
      </p>
      <p>
        Help your mom <span className="text-important">ditch the spam</span>.
      </p>
      <p>
        Just a few great reasons to buy a gift scan of Leave Me Alone today!
      </p>
      <GiftsPayment prices={PRICES} />
    </SubPageLayout>
  );
};

export default GiftsPage;
