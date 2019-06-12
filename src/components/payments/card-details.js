import './card-details.module.scss';

import React, { useContext, useEffect, useRef } from 'react';

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
  const cardRef = useRef(null);

  const { actions } = useContext(StripeStateContext);

  useEffect(() => {
    actions.setCardRef(cardRef);
    return function cleanup() {
      actions.reset();
    };
  }, []);

  return (
    <FormGroup>
      <div
        styleName={cx('wrapper', {
          loading,
          disabled
        })}
      >
        <CardElement
          ref={cardRef}
          {...cardElementOptions}
          onReady={() => actions.setReady()}
        />
      </div>
    </FormGroup>
  );
}

export default CardDetails;
