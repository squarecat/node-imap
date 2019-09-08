import React, { useCallback, useEffect, useState } from 'react';

import { FormInput } from '../index';
import Hashes from 'jshashes';
import request from '../../../utils/request';

const baseUrl = 'https://api.pwnedpasswords.com/range';

const compromisedPasswordText = `
This password was found in a database of compromised passwords. Using a password that
has been breached is seriously dangerous.
If you use this password for any other services then you should change it immediately.`;
const minLength = 6;
const passwordLengthText = 'Password must be greater than 6 characters';

const PasswordField = function({
  doValidation = true,
  onChange = () => {},
  autoComplete = 'current-password',
  autoFocus = true,
  smaller = false,
  ...props
}) {
  const [value, setValue] = useState('');
  const [state, setState] = useState({ isValid: false, message: '' });

  useEffect(() => {
    const validate = async () => {
      if (doValidation) {
        if (value.length < minLength) {
          return setState({
            isValid: false,
            message: passwordLengthText
          });
        }
        const isPwned = await fetchPwnedStatus(value);
        if (isPwned) {
          console.log('password is pwned');
          return setState({
            isValid: false,
            message: compromisedPasswordText
          });
        }
      }

      if (!state.isValid) {
        return setState({
          isValid: true,
          message: ''
        });
      }
    };
    if (value) {
      validate();
    }
  }, [doValidation, state.isValid, value]);
  useEffect(() => {
    onChange(value, { isValid: state.isValid, message: state.message });
  }, [value, state.isValid, state.message, onChange]);

  const onInputChange = useCallback(
    ({ currentTarget }) => {
      if (value !== currentTarget.value) {
        setValue(currentTarget.value);
      }
    },
    [value]
  );

  return (
    <FormInput
      {...props}
      smaller={smaller}
      onChange={onInputChange}
      autoFocus={autoFocus}
      value={value}
      compact
      type="password"
      required
      validation={() => (state.isValid ? '' : state.message)}
      autoComplete={autoComplete}
    />
  );
};

async function fetchPwnedStatus(password) {
  const passwordDigest = new Hashes.SHA1().hex(password);
  const digestFive = passwordDigest.substring(0, 5).toUpperCase();
  const queryUrl = `${baseUrl}/${digestFive}`;
  const checkDigest = passwordDigest.substring(5, 41).toUpperCase();

  const res = await fetch(queryUrl);
  const response = await res.text();
  const isPwned = response.search(checkDigest) > -1;
  return isPwned;
}

export default PasswordField;
