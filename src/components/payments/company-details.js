import { FormGroup, FormInput } from '../form';

import React from 'react';

export default ({ companyDetails, loading, onChange }) => {
  return (
    <>
      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          placeholder="Company name"
          value={companyDetails.name}
          name="name"
          onChange={e => {
            onChange('name', e.currentTarget.value);
          }}
        />
      </FormGroup>

      <FormGroup>
        <FormInput
          smaller
          disabled={loading}
          placeholder="VAT number"
          value={companyDetails.vatNumber}
          name="vatNumber"
          onChange={e => {
            onChange('vatNumber', e.currentTarget.value);
          }}
        />
      </FormGroup>
    </>
  );
};
