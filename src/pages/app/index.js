import React, { useState } from 'react';
import 'isomorphic-fetch';
import { Transition } from 'react-transition-group';
import Modal from '../../components/price-modal';
import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import logo from '../../assets/envelope-logo.png';
import useUser from '../../utils/hooks/use-user';

import MailList from './mail-list';
import Welcome from './welcome';

import './index.css';

let doScan = false;
if (typeof URLSearchParams !== 'undefined' && typeof window !== 'undefined') {
  doScan = new URLSearchParams(window.location.search).get('doScan');
}
if (doScan) {
  history.replaceState({}, '', window.location.pathname);
}

export default function App() {
  return (
    <AppLayout>
      <Auth>
        <AuthApp />
      </Auth>
    </AppLayout>
  );
}

function AuthApp() {
  const [showPriceModal, togglePriceModal] = useState(false);
  const [timeframe, setTimeframe] = useState(doScan);

  const [hasSearched] = useUser(s => s.hasSearched);
  const [isBeta] = useUser(s => s.beta);

  return (
    <>
      <div className="header">
        <a href="/app" className="header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="header-title">Leave Me Alone </div>
        <a className="basic-btn logout" href="/auth/logout">
          Logout
        </a>
      </div>
      <div className="app-content">
        <Transition
          in={!hasSearched && !timeframe}
          classNames="welcome-content"
          timeout={250}
          unmountOnExit
        >
          {state => (
            <div className={`welcome-content ${state}`}>
              <Welcome
                openPriceModal={() => togglePriceModal(true)}
                isBeta={isBeta}
              />
            </div>
          )}
        </Transition>

        <Transition
          in={!!(hasSearched || timeframe)}
          classNames="mail-list-content"
          timeout={250}
          mountOnEnter
          appear
        >
          {state => (
            <div className={`mail-list-content ${state}`}>
              <MailList
                timeframe={timeframe}
                hasSearched={hasSearched}
                showPriceModal={() => togglePriceModal(true)}
              />
            </div>
          )}
        </Transition>
      </div>
      {showPriceModal ? (
        <Modal
          onPurchase={option => {
            setTimeframe(option);
            togglePriceModal(false);
          }}
          onClose={() => togglePriceModal(false)}
        />
      ) : null}
    </>
  );
}
