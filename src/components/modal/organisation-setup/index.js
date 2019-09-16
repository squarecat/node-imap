import './organisation-setup.module.scss';

import { FormCheckbox, FormGroup, FormInput, FormLabel } from '../../form';
import { ModalBody, ModalHeader } from '..';
import React, { useReducer } from 'react';

import orgSetupReducer from './reducer';
import useUser from '../../../utils/hooks/use-user';

export default () => {
  const [{ email }] = useUser(u => ({
    email: u.email
  }));

  const [state, dispatch] = useReducer(orgSetupReducer, {
    name: '',
    domain: '',
    allowAnyUserWithCompanyEmail: false,
    email: email || '',
    loading: false,
    error: false
  });

  return (
    <div styleName="setup">
      <ModalBody>
        <ModalHeader>Let's set up your Team account</ModalHeader>
        <FormGroup unpadded>
          <FormLabel htmlFor="imap-host">Team name</FormLabel>
          <FormInput
            name="name"
            smaller
            disabled={state.loading}
            required
            placeholder="Company Inc"
            value={state.name}
            onChange={e => {
              const name = e.currentTarget.value;
              if (name !== state.name) {
                dispatch({
                  type: 'set-org-detail',
                  data: { name }
                });
              }
            }}
          />
          <p>
            Your company or team name. If you don't have one, you can just use
            your own name.
          </p>
        </FormGroup>

        <FormGroup unpadded>
          <FormLabel htmlFor="imap-host">Company domain (optional)</FormLabel>
          <FormInput
            name="name"
            smaller
            disabled={state.loading}
            placeholder="mycompany.io"
            value={state.domain}
            onChange={e => {
              const domain = e.currentTarget.value;
              if (domain !== state.domain) {
                dispatch({
                  type: 'set-org-detail',
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
            Optional: your company domain
          </p>
        </FormGroup>
        <FormGroup unpadded>
          <FormCheckbox
            disabled={state.loading}
            onChange={() =>
              dispatch({
                type: 'set-org-detail',
                data: { allowAnyUserWithCompanyEmail: !state.allowAnyUserWithCompanyEmail }
              });
            }
            checked={state.allowAnyUserWithCompanyEmail}
            label={
              <span>
                Allow anyone with an email address at the above domain to
                automatically join your Team.
              </span>
            }
          />
          {state.toggling ? <span styleName="saving">Saving...</span> : null}
        </FormGroup>
      </ModalBody>
    </div>
  );
};
