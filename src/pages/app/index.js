import React, { useState, useEffect } from 'react';
import 'isomorphic-fetch';
import { Transition } from 'react-transition-group';
import { Link } from 'gatsby';

import Button from '../../components/btn';
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
  const [showSettings, setShowSettings] = useState();
  const [user] = useUser();
  const { hasSearched, beta: isBeta, profileImg } = user;

  const onClickBody = ({ target }) => {
    let { parentElement } = target;
    while (parentElement !== document.body) {
      if (parentElement.classList.contains('settings-dropdown-toggle')) {
        return;
      }
      parentElement = parentElement.parentElement;
    }
    setShowSettings(false);
  };
  useEffect(
    () => {
      if (showSettings) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
    },
    [showSettings]
  );
  return (
    <>
      <div className="header">
        <a href="/app" className="header-logo">
          <img alt="logo" src={logo} />
        </a>
        <div className="header-title">Leave Me Alone </div>

        <div className="settings-dropdown">
          <Button
            compact
            className="settings-dropdown-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            <div className="profile">
              <img className="profile-img" src={profileImg} />
            </div>
          </Button>
          <ul
            className={`settings-dropdown-list ${showSettings ? 'shown' : ''}`}
          >
            <li>
              <Link to="/app/history/scans">Scan history</Link>
            </li>
            <li>
              <Link to="/app/history/unsubscriptions">Unsub history</Link>
            </li>
            <li className="logout">
              <a href="/auth/logout">Logout</a>
            </li>
          </ul>
        </div>
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
