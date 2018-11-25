import React, { useState } from 'react';

import logo from '../../assets/transparent-logo.png';
import MailList from './mail-list';
import './welcome.css';

export default ({ isScanning }) => {
  return (
    <>
      <div className={`collapsable ${isScanning ? 'collapsed' : ''}`}>
        <div className="first-logon-content">
          <p>Lets get started!</p>{' '}
          <p>
            <strong>Leave Me Alone</strong> will scan your Gmail inbox, and find
            all the subscripion emails that you are receiving.
          </p>
          <div className="">
            <img src={logo} className="first-logon-image" />
          </div>
          <p>You can then choose if you want to stay subscribed, or cancel.</p>
        </div>
      </div>
    </>
  );
};
