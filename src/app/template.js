import './template.module.scss';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import React from 'react';
// import ReferralModal from '../components/modal/referral-modal';
import useUser from '../utils/hooks/use-user';

export default ({ pageName, children }) => {
  const [user] = useUser();
  const loaded = !!user;
  return (
    <AppLayout pageName={pageName}>
      <Auth loaded={loaded}>
        <Header loaded={loaded} />
        <ErrorBoundary>
          <div styleName="app-content">{loaded ? children : null}</div>
        </ErrorBoundary>
        {/* {showReferrerModal ? (
          <ReferralModal onClose={() => toggleReferrerModal(false)} />
        ) : null}
        */}
      </Auth>
    </AppLayout>
  );
};
