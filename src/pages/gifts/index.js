import './gifts.module.scss';

import GiftsPrices from './gifts-prices';
import { PRICES } from '../../utils/prices';
import React from 'react';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextImportant } from '../../components/text';

const GiftsPage = () => {
  return (
    <SubPageLayout title="Gift a scan" centered>
      <h1>Gift a clean inbox</h1>
      <span styleName="emoji">🎁</span>
      <p>
        Increase your <TextImportant>team's productivity</TextImportant>.
      </p>
      <p>
        Give your loved one the gift of a{' '}
        <TextImportant>clean inbox</TextImportant>.
      </p>
      <p>
        Help your mom <TextImportant>ditch the spam</TextImportant>.
      </p>
      <p>
        Just a few great reasons to buy a gift scan of Leave Me Alone today!
      </p>
      <GiftsPrices prices={PRICES} />
      <div styleName="gift-discount">
        <h3>Buy more than 1 scan and receive a discount</h3>
        <p>
          5 scans or more - <TextImportant>25% off</TextImportant>
        </p>
        <p>
          50 scans or more - <TextImportant>40% off</TextImportant>
        </p>
        <GiftsPrices prices={PRICES} />
        <p>
          More than 100 scans - you might be interested in our{' '}
          <a href="/enterprise">enterprise pricing plan</a>.
        </p>
      </div>
    </SubPageLayout>
  );
};

export default GiftsPage;
