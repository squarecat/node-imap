import React, { useState, useEffect } from 'react';

import { FormCheckbox, FormGroup, FormInput, FormSelect } from '../form';

import { useAsync } from '../../utils/hooks';
import request from '../../utils/request';

export default ({ addressDetails, loading, onChange }) => {
  const { value: countries = [], loading: countriesLoading } = useAsync(
    fetchCountries
  );
  const [options, setOptions] = useState([]);

  useEffect(
    () => {
      if (!countriesLoading && !options.length) {
        const map = countries.map(c => ({ value: c.code, label: c.name }));
        setOptions(map);
      }
    },
    [countriesLoading]
  );

  return (
    <>
      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          required
          placeholder="Name"
          value={addressDetails.name}
          name="name"
          onChange={e => {
            onChange('name', e.currentTarget.value);
          }}
        />
      </FormGroup>

      <FormGroup container>
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
      </FormGroup>
    </>
  );
};

function fetchCountries() {
  return request('/api/countries.json');
}
