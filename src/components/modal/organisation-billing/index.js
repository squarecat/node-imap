import './organisation-billing.module.scss';

import BillingForm from './billing-form';
import { Elements } from 'react-stripe-elements';
import React from 'react';

function OrganisationBillingModal({ organisation, onSuccess }) {
  return (
    <div styleName="organisation-billing-modal">
      <Elements>
        <BillingForm organisation={organisation} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}

export default OrganisationBillingModal;
