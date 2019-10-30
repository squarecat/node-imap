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
      <App pageName={pageName}>{children}</App>
    </AppLayout>
  );
}

const App = React.memo(({ children, pageName }) => {
  const [isLoaded] = useUser(u => u.loaded);
  console.log(pageName);

  const content = useMemo(() => {
    return (
      <main role="main" styleName="app-content">
        {isLoaded ? children : null}
      </main>
    );
  }, [children, isLoaded]);

  const showLoading = !pageName;
  return (
    <>
      <Header loaded={isLoaded} />
      <Auth showLoading={showLoading} loaded={isLoaded}>
        <ErrorBoundary>{content}</ErrorBoundary>
      </Auth>
    </>
  );
});

export default AppLayoutContainer;
