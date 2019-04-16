import React, { useEffect, useState } from 'react';

import { FormInput } from '../index';
import Hashes from 'jshashes';

const baseUrl = 'https://api.pwnedpasswords.com/range';

const compromisedPasswordText = `
This password was found in a database of compromised passwords. Using a password that has been breached is seriously dangerous.
If you use this password for any other services then you should
change it immediately.
`;
const minLength = 6;
const passwordLengthText = 'Password must be greater than 6 characters';

export default ({ checkIfPwned = true, onChange = () => {} }) => {
  const [value, setValue] = useState('');
  const [state, setState] = useState({ isValid: false, message: '' });

  const validate = async () => {
    if (value.length < minLength) {
      console.log('password not long enough - ' + value);
      return setState({
        isValid: false,
        message: passwordLengthText
      });
    }
    if (checkIfPwned) {
      const isPwned = await fetchPwnedStatus(value);
      if (isPwned) {
        console.log('password is pwned');
        return setState({
          isValid: false,
          message: compromisedPasswordText
        });
      }
    }
    console.log('password is ok');
    return setState({
      isValid: true,
      message: ''
    });
  };
  useEffect(
    () => {
      validate();
    },
    [value]
  );
  useEffect(
    () => {
      console.log(value);
      onChange(value, { isValid: state.isValid, message: state.message });
    },
    [value, state.isValid, state.message]
  );
  return (
    <FormInput
      onInput={({ currentTarget }) => setValue(currentTarget.value)}
      noFocus
      value={value}
      compact
      id="password"
      type="password"
      name="password"
      required
      validation={() => (state.isValid ? '' : state.message)}
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
