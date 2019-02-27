import GiftsPayment from '../components/gifts/gifts';
import { PRICES } from '../components/price-modal';
import React from 'react';
import SubPageLayout from '../layouts/subpage-layout';

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
        Give your loved one the gift of a{' '}
        <span className="text-important">clean inbox</span>.
      </p>
      <p>
        Help your mom <span className="text-important">ditch the spam</span>.
      </p>
      <p>
        Just a few great reasons to buy a gift scan of Leave Me Alone today!
      </p>
      <GiftsPayment prices={PRICES} />
      <div className="gift-discount">
        <h3>Buy more than 1 scan and receive a discount</h3>
        <p>
          5 scans or more - <span className="text-important">25% off</span>
        </p>
        <p>
          50 scans or more - <span className="text-important">40% off</span>
        </p>
        <GiftsPayment prices={PRICES} />
        <p>
          More than 100 scans - you might be interested in our{' '}
          <a href="/enterprise">enterprise pricing plan</a>.
        </p>
      </div>
    </SubPageLayout>
  );
};

export default GiftsPage;
