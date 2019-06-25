import './template.module.scss';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import React from 'react';
import useUser from '../utils/hooks/use-user';

export default ({ pageName, children }) => {
  return (
    <AppLayout pageName={pageName}>
      <App>{children}</App>
    </AppLayout>
  );
};

function App({ children }) {
  const [user] = useUser();
  const loaded = !!user;

  return (
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
  );
}
