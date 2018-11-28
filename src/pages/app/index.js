import React, { useState } from 'react';

import Modal from '../../components/price-modal';
import AppLayout from '../../components/app-layout';
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
  const [isScanning, setScanning] = useState(false);
  const [timeframe, setTimeframe] = useState(null);
  const [isDoneSeaching, setDoneSearching] = useState(false);
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
        {!hasSearched ? <Welcome isScanning={isScanning} /> : null}
        {!hasSearched && !isDoneSeaching ? (
          <div className="action">
            <a
              className={`btn ${isScanning ? 'disabled' : ''} centered`}
              onClick={() => togglePriceModal(true)}
            >
              {isScanning ? 'Scanning...' : 'Scan my inbox'}
            </a>
          </div>
        ) : null}
        {hasSearched || timeframe ? (
          <MailList
            onFinished={() => setDoneSearching(true)}
            timeframe={timeframe}
            hasSearched={hasSearched}
            showPriceModal={() => togglePriceModal(true)}
          />
        ) : null}
      </div>
      {showPriceModal ? (
        <Modal
          onPurchase={option => {
            setScanning(true);
            setTimeframe(option);
            togglePriceModal(false);
          }}
          onClose={() => togglePriceModal(false)}
        />
      ) : null}
    </>
  );
}
