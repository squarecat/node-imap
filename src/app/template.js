import './template.module.scss';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import React, { useMemo } from 'react';

import useUser from '../utils/hooks/use-user';

function AppLayoutContainer({ pageName, children, showLoading = true }) {
  return (
    <AppLayout pageName={pageName}>
      <App pageName={pageName} showLoading={showLoading}>
        {children}
      </App>
    </AppLayout>
  );
}

const App = React.memo(({ children, pageName, showLoading }) => {
  const [isLoaded] = useUser(u => u.loaded);
  console.log(pageName);

  const content = useMemo(() => {
    return (
      <main role="main" styleName="app-content">
        {isLoaded ? children : null}
      </main>
    );
  }, [children, isLoaded]);

  let doShowLoading = showLoading;
  if (pageName) {
    doShowLoading = false;
  }

  return (
    <>
      <Header loaded={!doShowLoading || isLoaded} />
      <Auth showLoading={doShowLoading} loaded={isLoaded}>
        <ErrorBoundary>{content}</ErrorBoundary>
      </Auth>
    </>
  );
});

export default AppLayoutContainer;
