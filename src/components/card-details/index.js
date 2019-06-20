import './card-details.module.scss';

import { CreditCardIcon } from '../icons';
import React from 'react';
import cx from 'classnames';

export default ({ card, padded = false }) => (
  <div
    styleName={cx('details', {
      padded
    })}
  >
    <div styleName="box last4">
      <CreditCardIcon />
      {`•••• •••• •••• ${card.last4}`}
    </div>
    <div styleName="box expires">
      <span>
        {card.exp_month}/{card.exp_year}
      </span>
    </div>
  </div>
);
