import React, { useState } from 'react';

import logo from '../../assets/transparent-logo.png';
import './welcome.css';

export default ({ openPriceModal }) => {
  const [isScanning, setScanning] = useState(false);
  return (
    <>
      <div>
        <div className="first-logon-content">
          <h2>Let's get started!</h2>
          <p>
            <strong>Leave Me Alone</strong> will scan your Gmail inbox, and find
            all the subscripion emails that you are receiving.
          </p>
          <div className="">
            <img src={logo} className="first-logon-image" />
          </div>
          <p>
            You can then choose if you want to stay subscribed, or cancel the
            subscription.
          </p>
        </div>
        <div className="action">
          <a
            className={`btn ${isScanning ? 'disabled' : ''} centered`}
            onClick={() => {
              setScanning(true);
              openPriceModal();
            }}
          >
            Scan my inbox
          </a>
        </div>
      </div>
    </>
  );
};
