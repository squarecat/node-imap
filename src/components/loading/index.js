import React from 'react';
import envelopeLogo from '../../assets/envelope.png';
import girlLogo from '../../assets/leavemealonegirl.png';

export default () => {
  return (
    <div className="dice">
      <div className="auth-loading-pane auth-loading-pane--front">
        <img src={girlLogo} alt="girl-logo" className="girl-logo" />
      </div>
      <div className="auth-loading-pane auth-loading-pane--back">
        <img src={envelopeLogo} alt="envelope-logo" className="envelope-logo" />
      </div>
    </div>
  );
};
