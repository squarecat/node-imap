import './organisation-onboarding.module.scss';

import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../../form';
import React, { useContext } from 'react';

import { OnboardingContext } from './';

export default () => {
  const { state, dispatch } = useContext(OnboardingContext);

  return (
    <form id="org-setup-form" name="org-setup-form">
      <FormGroup unpadded>
        <FormLabel htmlFor="email">Admin email</FormLabel>
        <FormInput
          name="email"
          smaller
          disabled={true}
          required
          value={state.organisation.adminUserEmail}
          onChange={() => {}}
        />
        <p>
          This is your primary email address. If you need to change this please
          contact us.
        </p>
      </FormGroup>

      <FormGroup unpadded>
        <FormLabel htmlFor="name">Team name</FormLabel>
        <FormInput
          name="name"
          smaller
          disabled={state.loading}
          required
          placeholder="Company Inc"
          value={state.organisation.name}
          onChange={e => {
            const name = e.currentTarget.value;
            if (name !== state.organisation.name) {
              dispatch({
                type: 'set-organisation',
                data: { name }
              });
            }
          }}
        />
        <p>
          Your company or team name. If you don't have one, you can use your own
          name.
        </p>
      </FormGroup>

      <FormGroup unpadded>
        <FormLabel htmlFor="domain">Company domain (optional)</FormLabel>
        <FormInput
          name="domain"
          smaller
          disabled={state.loading}
          placeholder="mycompany.io"
          value={state.organisation.domain}
          onChange={e => {
            const domain = e.currentTarget.value;
            if (domain !== state.organisation.domain) {
              dispatch({
                type: 'set-organisation',
                data: { domain }
              });
            }
          }}
          validation={value =>
            value.includes('http') || value.includes('www')
              ? 'Use just your domain without the protocol'
              : true
          }
        />
        <p>
          Optional: your company domain without the protcol, e.g. google.com
        </p>
      </FormGroup>
      <FormGroup>
        <FormCheckbox
          name="allowAnyUserWithCompanyEmail"
          disabled={state.loading}
          onChange={() =>
            dispatch({
              type: 'set-organisation',
              data: {
                allowAnyUserWithCompanyEmail: !state.organisation
                  .allowAnyUserWithCompanyEmail
              }
            })
          }
          checked={state.organisation.allowAnyUserWithCompanyEmail}
          label={
            <span>
              Allow anyone with an email address at the above domain to
              automatically join your team
            </span>
          }
        />
      </FormGroup>
      {state.error ? (
        <FormGroup>
          <FormNotification error>{state.error}</FormNotification>
        </FormGroup>
      ) : null}
    </form>
  );
};
