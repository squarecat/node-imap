import React, { useState, useEffect } from 'react';

import { FormCheckbox, FormGroup, FormInput, FormSelect } from '../form';

import { useAsync } from '../../utils/hooks';
import request from '../../utils/request';

export default ({ companyDetails, loading, onChange }) => {
  return (
    <>
      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          required
          placeholder="Company name"
          value={companyDetails.name}
          name="name"
          onChange={e => {
            onChange('name', e.currentTarget.value);
          }}
        />
      </FormGroup>

      {/* TODO text area for address */}
      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          required
          placeholder="Company address"
          value={companyDetails.address}
          name="address"
          onChange={e => {
            onChange('address', e.currentTarget.value);
          }}
        />
      </FormGroup>

      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          required
          placeholder="VAT number"
          value={companyDetails.vatNumber}
          name="vatNumber"
          onChange={e => {
            onChange('vatNumber', e.currentTarget.value);
          }}
        />
      </FormGroup>

      {/* <FormGroup container>
        <FormInput
          smaller
          disabled={loading}
          required
          basic
          placeholder="Address"
          value={addressDetails.line1}
          name="Address"
          onChange={e => {
            onChange('line1', e.currentTarget.value);
          }}
        />
        <FormInput
          smaller
          disabled={loading}
          required
          basic
          placeholder="City"
          value={addressDetails.city}
          name="City"
          onChange={e => {
            onChange('city', e.currentTarget.value);
          }}
        />
        <FormSelect
          smaller
          disabled={loading}
          required
          basic
          value={addressDetails.country}
          placeholder="Country"
          options={options}
          onChange={e => {
            onChange('country', e.currentTarget.value);
          }}
        />
        <FormInput
          smaller
          disabled={loading}
          required
          basic
          placeholder={
            addressDetails.country === 'US' ? 'Zipcode' : 'Postal code'
          }
          value={addressDetails.postal_code}
          name="postal_code"
          onChange={e => {
            onChange('postal_code', e.currentTarget.value);
          }}
        />
      </FormGroup> */}
    </>
  );
};

function validateVatNumber(vatNumber) {
  return request('/api/payments/vat', {
    method: 'POST',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ vatNumber })
  });
}
