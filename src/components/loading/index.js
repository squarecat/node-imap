import './loading.module.scss';

import React from 'react';
import envelopeLogo from '../../assets/envelope.png';
import girlLogo from '../../assets/leavemealonegirl.png';

export default ({ loaded = false }) => {
  return (
    <div styleName={`dice ${loaded ? 'loaded' : ''}`}>
      <div styleName="loading-pane front">
        <img src={girlLogo} alt="girl-logo" styleName="girl-logo" />
      </div>
      <div styleName="loading-pane back">
        <img src={envelopeLogo} alt="envelope-logo" styleName="envelope-logo" />
      </div>
    </div>
  );
};
