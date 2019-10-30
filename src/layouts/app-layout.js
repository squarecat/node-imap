import '@babel/polyfill';
import '../common.scss';
import './layout.css';

import React, { useEffect } from 'react';

import { AlertProvider } from '../providers/alert-provider';
import { DatabaseProvider } from '../providers/db-provider';
import Helmet from 'react-helmet';
import { ModalProvider } from '../providers/modal-provider';
import { setConfig } from 'react-hot-loader';
import { UserProvider } from '../providers/user-provider';

import { SocketProvider } from '../providers/socket-provider';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;

setConfig({ pureSFC: true });

const AppLayout = ({ pageName, children }) => {
  useEffect(() => {
    loadMetomicScripts();
    if (window.intergram && window.intergram.hide) {
      window.intergram.hide();
    }
  }, []);
  return (
    <>
      <Helmet
        title={`${pageName || 'Home'} | Leave Me Alone`}
        lang="en"
        meta={[
          {
            name: 'charSet',
            content: 'utf-8'
          },
          {
            name: 'viewport',
            content: 'width=device-width, initial-scale=1.0'
          }
        ]}
        link={[{ rel: 'icon', type: 'image/png', href: faviconUrl }]}
      />

      <a href="#main" className="skip-to-content">
        Skip to mail list
      </a>

      <DatabaseProvider>
        <AlertProvider>
          <UserProvider>
            <SocketProvider>
              <ModalProvider>{children}</ModalProvider>
            </SocketProvider>
          </UserProvider>
        </AlertProvider>
      </DatabaseProvider>
    </>
  );
};

export default AppLayout;

function loadMetomicScripts() {
  [...document.querySelectorAll('[type="text/x-metomic"]')].forEach(e => {
    const newNode = document.createElement('script');
    newNode.type = 'text/javascript';
    if (e.src) {
      newNode.src = `${e.src}?${Date.now()}`;
    }
    if (e.innerHTML) {
      newNode.innerHTML = e.innerHTML;
    }
    const p = e.parentElement;
    p.removeChild(e);
    document.body.appendChild(newNode);
  });
}
