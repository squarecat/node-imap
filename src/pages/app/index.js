import React, { useState, useEffect } from 'react';

import { Image } from 'gatsby';

import AppLayout from '../../components/app-layout';
import Auth from '../../components/auth';
import logo from '../../assets/transparent-logo.png';
import MailList from './mail-list';

import './index.css';

export default function() {
  const [isScanning, setScanning] = useState(false);
  const [isDone, setDone] = useState(false);
  const startScan = () => {
    setScanning(true);
  };

  return (
    <AppLayout>
      <Auth>
        <div className="header">
          <a href="/app" className="header-logo">
            <img src={logo} />
          </a>
          <div className="header-title">Leave Me Alone </div>
          <a className="basic-btn logout" href="/auth/logout">
            Logout
          </a>
        </div>
        <div className="app-content">
          <div className={`collapsable ${isScanning ? 'collapsed' : ''}`}>
            <div className="first-logon-content">
              <p>Lets get started!</p>{' '}
              <p>
                <strong>Leave Me Alone</strong> will scan your Gmail inbox, and
                find all the subscripion emails that you are receiving.
              </p>
              <div className="">
                <img src={logo} className="first-logon-image" />
              </div>
              <p>
                You can then choose if you want to stay subscribed, or cancel.
              </p>
            </div>
          </div>
          {!isDone ? (
            <div className="action">
              <a
                className={`btn ${isScanning ? 'disabled' : ''}`}
                onClick={() => startScan()}
              >
                {isScanning ? 'Scanning...' : 'Scan my inbox'}
              </a>
            </div>
          ) : null}
          {isScanning ? (
            <div className="mail">
              <MailList onFinished={() => setDone(true)} />
            </div>
          ) : null}
        </div>
      </Auth>
    </AppLayout>
  );
}
