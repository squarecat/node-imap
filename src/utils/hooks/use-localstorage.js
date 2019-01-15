import { useState } from 'react';
import LZString from 'lz-string';

// if you make breaking changes to this file
// then increment this version number!
const localStorageVersion = 1;

const useLocalStorage = (propertyName, defaultValue) => {
  const storedValue = get(propertyName);
  const [property, setProperty] = useState(storedValue || defaultValue);

  // on set, set on localstorage, and update the state
  function set(value) {
    setProperty(value);
    localStorage.setItem(
      propertyName,
      JSON.stringify({
        version: localStorageVersion,
        value: LZString.compress(JSON.stringify(value))
      })
    );
  }

  return [property, set];
};

export default useLocalStorage;

function get(propertyName) {
  let storage;
  try {
    if (typeof localStorage !== 'undefined') {
      storage = localStorage;
    }
    if (storage) {
      const data = JSON.parse(storage.getItem(propertyName));
      if (!data || data.version !== localStorageVersion) {
        console.warn('old version of localstorage, clearing');
        return null;
      }
      return JSON.parse(LZString.decompress(data.value));
    }
  } catch (err) {
    console.warn('failed to decompress localstorage, clearing');
  }
  return null;
}
