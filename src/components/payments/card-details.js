import './card-details.module.scss';

import React, { useContext, useEffect } from 'react';

import { CardElement } from 'react-stripe-elements';
import { FormGroup } from '../form';
import { StripeStateContext } from '../../providers/stripe-provider';
import cx from 'classnames';

const cardElementOptions = {
  hidePostalCode: true,
  style: {
    base: {
      iconColor: '#bfbfbf',
      color: '#333333',
      lineHeight: '46px',
      fontWeight: 300,
      fontFamily: 'Gotham-Rounded, Helvetica Neue',
      fontSize: '16px',
      '::placeholder': {
        color: '#bfbfbf'
      }
    },
    invalid: {
      color: '#f1645f'
    }
  }
};

function CardDetails({ loading = false, disabled = false }) {
  const { actions } = useContext(StripeStateContext);

  useEffect(() => {
    return function cleanup() {
      actions.reset();
    };
  }, []); // do not pass actions in here or cleaup fires when the stripe state changes

  return (
    <FormGroup>
      <div
        styleName={cx('wrapper', {
          loading,
          disabled
        })}
      >
        <CardElement
          {...cardElementOptions}
          onReady={el => actions.setReady(el)}
        />
      </div>
    </FormGroup>
  );
}

export default CardDetails;
