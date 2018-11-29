import React, { useState } from 'react';
import { TransitionGroup, Transition } from 'react-transition-group';

import Modal from '../../components/price-modal';
import AppLayout from '../../layouts/app-layout';
import Auth from '../../components/auth';
import logo from '../../assets/transparent-logo.png';

import MailList from './mail-list';
import Welcome from './welcome';

import './index.css';
import useGlobal from '../../utils/hooks/use-global';

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
  const [timeframe, setTimeframe] = useState(null);

  const [user] = useGlobal('user');
  const { hasSearched } = user;

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
              <Welcome openPriceModal={() => togglePriceModal(true)} />
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
