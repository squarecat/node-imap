import './organisation-billing.module.scss';

import BillingForm from './billing-form';
import { Elements } from 'react-stripe-elements';
import React from 'react';
import { StripeProvider } from '../../../providers/stripe-provider';

function OrganisationBillingModal({ organisation, onSuccess }) {
  return (
    <div styleName="organisation-billing-modal">
      <StripeProvider>
        <Elements>
          <BillingForm organisation={organisation} onSuccess={onSuccess} />
        </Elements>
      </StripeProvider>
    </div>
  );
}

export default OrganisationBillingModal;
