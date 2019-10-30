import './template.module.scss';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import React, { useMemo } from 'react';

import useUser from '../utils/hooks/use-user';

function AppLayoutContainer({ pageName, children }) {
  return (
    <AppLayout pageName={pageName}>
      <App>{children}</App>
    </AppLayout>
  );
}

const App = React.memo(({ children }) => {
  const [isLoaded] = useUser(u => u.loaded);

  const content = useMemo(() => {
    return (
      <main role="main" styleName="app-content">
        {isLoaded ? children : null}
      </main>
    );
  }, [children, isLoaded]);

  return (
    <>
      <Header loaded={isLoaded} />
      <Auth loaded={isLoaded}>
        <ErrorBoundary>{content}</ErrorBoundary>
      </Auth>
    </>
  );
});

export default AppLayoutContainer;
