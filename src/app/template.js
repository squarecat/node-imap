import './template.module.scss';

import AppLayout from '../layouts/app-layout';
import Auth from '../components/auth';
import ErrorBoundary from '../components/error-boundary';
import Header from '../components/header';
import React, { useRef } from 'react';
import { SocketProvider } from '../providers/socket-provider';
import useUser from '../utils/hooks/use-user';

function AppLayoutContainer({ pageName, children }) {
  return (
    <AppLayout pageName={pageName}>
      <App>{children}</App>
    </AppLayout>
  );
}

function App({ children }) {
  const [isLoaded] = useUser(u => u.loaded);
  const mainRef = useRef(null);

  return (
    <>
      <Header loaded={isLoaded} />
      <Auth loaded={isLoaded}>
        <SocketProvider>
          <ErrorBoundary>
            <main role="main" ref={mainRef} styleName="app-content">
              {isLoaded ? children : null}
            </main>
          </ErrorBoundary>
        </SocketProvider>
      </Auth>
    </>
  );
}

export default AppLayoutContainer;
