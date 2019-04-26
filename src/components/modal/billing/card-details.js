import './card-details.module.scss';

import { CreditCardIcon } from '../../icons';
import React from 'react';

export default ({ card }) => (
  <div styleName="details">
    <div styleName="card-last4">
      <CreditCardIcon />
      {`•••• •••• •••• ${card.last4}`}
    </div>
    <div styleName="card-expires">
      <span>Expires: </span>
      <span>
        {card.exp_month}/{card.exp_year}
      </span>
    </div>
  </div>
);
