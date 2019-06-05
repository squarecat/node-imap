import './card-details.module.scss';

import { CreditCardIcon } from '../icons';
import React from 'react';

export default ({ card }) => (
  <div styleName="details">
    <div styleName="box last4">
      <CreditCardIcon />
      {`•••• •••• •••• ${card.last4}`}
    </div>
    <div styleName="box expires">
      <span>Expires: </span>
      <span>
        {card.exp_month}/{card.exp_year}
      </span>
    </div>
  </div>
);
