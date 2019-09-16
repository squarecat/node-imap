import './organisation-onboarding.module.scss';

import {
  FormCheckbox,
  FormGroup,
  FormInput,
  FormLabel,
  FormNotification
} from '../../form';
import React, { useCallback, useReducer } from 'react';

import orgSetupReducer from './setup-reducer';
import request from '../../../utils/request';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [
    { organisationId, organisation, email },
    { setOrganisation }
  ] = useUser(u => ({
    organisationId: u.organisationId,
    organisation: u.organisation,
    email: u.email
  }));

  console.log('setup organisation', organisation);

  const [state, dispatch] = useReducer(orgSetupReducer, {
    organisation: {
      name: '',
      domain: '',
      allowAnyUserWithCompanyEmail: false,
      adminEmail: email,
      ...organisation
    },
    loading: false,
    error: false
  });

  const onSubmit = useCallback(async () => {
    try {
      dispatch({ type: 'set-loading', data: true });
      dispatch({ type: 'set-error', data: false });
      const createdUpdatedOrg = await createUpdateOrganisation(
        organisationId,
        state.organisation
      );
      debugger;
      // todo just set the organisation on the user?
      setOrganisation(createdUpdatedOrg);
    } catch (err) {
      // const { message } = getCreateOrgError(err);
      const message = 'Failed to set up organisation';
      dispatch({ type: 'set-error', data: message });
    } finally {
      dispatch({ type: 'set-loading', data: false });
    }
  }, [organisationId, setOrganisation, state.organisation]);

  return (
    <form
      id="org-setup-form"
      name="org-setup-form"
      onSubmit={e => {
        e.preventDefault();
        onSubmit();
        return false;
      }}
    >
      <FormGroup unpadded>
        <FormLabel htmlFor="email">Admin email</FormLabel>
        <FormInput
          name="email"
          smaller
          disabled={true}
          required
          value={state.organisation.adminEmail}
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
              automatically join your Team
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

async function createUpdateOrganisation(id, data) {
  if (!id) {
    return request(`/api/organisation`, {
      method: 'POST',
      body: JSON.stringify({ organisation: data })
    });
  }
  return request(`/api/organisation/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ op: 'update', value: data })
  });
}
