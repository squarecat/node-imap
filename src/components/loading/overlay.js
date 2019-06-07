import './overlay.module.scss';

import Pulse from './pulse';
import React from 'react';

export default () => {
  return (
    <div styleName="overlay">
      <Pulse />
    </div>
  );
};
