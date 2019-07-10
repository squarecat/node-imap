import SubPageLayout, { SubpageTagline } from '../../layouts/subpage-layout';

import ProductHuntBadges from '../../components/landing/ph-badges';
import React from 'react';
import WallOfLove from '../../components/landing/wall-of-love';

export default function WallOfLovePage() {
  return (
    <SubPageLayout
      title="Wall of Love"
      description={`Our customers love Leave Me Alone. Here are some of the lovely things they've said about us!`}
    >
      <h1>Wall of Love</h1>
      <SubpageTagline>
        Our customers love Leave Me Alone. Here are some of the lovely things
        they've said about us!
      </SubpageTagline>
      <ProductHuntBadges />
      <WallOfLove />
    </SubPageLayout>
  );
}
