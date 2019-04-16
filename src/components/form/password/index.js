import React, { useEffect, useState } from 'react';

import { FormInput } from '../index';
import Hashes from 'jshashes';

const baseUrl = 'https://api.pwnedpasswords.com/range';

const compromisedPasswordText = `
This password was found in a database of compromised passwords 😔Using a password that has been breached is seriously dangerous.
If you use this password for any other services then you should
change it immediately.
`;

const passwordLengthText = 'Password must be at least 6 characters';

export default ({ checkIfPwned = true, onChange = () => {} }) => {
  const [value, setValue] = useState('');
  const { isValid, message } = useValidation(value, { checkIfPwned });
  useEffect(
    () => {
      onChange(value, { isValid, message });
    },
    [value, isValid, message]
  );
  return (
    <FormInput
      onChange={({ currentTarget }) => setValue(currentTarget.value)}
      noFocus
      compact
      id="password"
      type="password"
      name="password"
      required
      validation={() => (isValid ? '' : message)}
    />
  );
};

const minLength = 6;

function useValidation(value, { checkIfPwned }) {
  const [state, setState] = useState({ isValid: false, message: '' });
  const [timeoutId, setTimeoutId] = useState(0);

  const validate = async () => {
    if (value.length < minLength) {
      return setState({
        isValid: false,
        message: passwordLengthText
      });
    }
    if (checkIfPwned) {
      const isPwned = await fetchPwnedStatus(value);
      if (isPwned) {
        return setState({
          isValid: false,
          message: compromisedPasswordText
        });
      }
    }
    return setState({
      isValid: true,
      message: ''
    });
  };
  useEffect(
    () => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => validate());
      } else {
        clearTimeout(timeoutId);
        setTimeoutId(setTimeout(validate, 500));
      }
    },
    [value]
  );
  return state;
}

async function fetchPwnedStatus(password) {
  console.log(password);
  const passwordDigest = new Hashes.SHA1().hex(password);
  const digestFive = passwordDigest.substring(0, 5).toUpperCase();
  const queryUrl = `${baseUrl}/${digestFive}`;
  const checkDigest = passwordDigest.substring(5, 41).toUpperCase();
  const res = await fetch(queryUrl);
  const response = await res.text();
  const isPwned = response.search(checkDigest) > -1;
  return isPwned;
}
