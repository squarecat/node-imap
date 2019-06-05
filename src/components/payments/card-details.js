import React, { useContext, useRef, useEffect } from 'react';
import { FormGroup } from '../form';
import { CardElement } from 'react-stripe-elements';
import { StripeStateContext } from '../../providers/stripe-provider';

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

function CardDetails() {
  const cardRef = useRef(null);

  const { actions } = useContext(StripeStateContext);

  useEffect(
    () => {
      actions.setCardRef(cardRef);
      return function cleanup() {
        actions.reset();
      };
    },
    [cardRef]
  );

  return (
    <FormGroup>
      <CardElement
        ref={cardRef}
        {...cardElementOptions}
        onReady={() => actions.setReady()}
      />
    </FormGroup>
  );
}

export default CardDetails;
