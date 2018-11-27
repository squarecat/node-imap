import { useEffect, useState } from 'react';

const useLocalStorage = (propertyName, defaultValue) => {
  const storedValue = get(propertyName);
  const [property, setProperty] = useState(storedValue || defaultValue);

  // on set, set on localstorage, and update the state
  function set(value) {
    setProperty(value);
    localStorage.setItem(propertyName, JSON.stringify(value));
  }

  return [property, set];
};

export default useLocalStorage;

function get(propertyName) {
  let storage;
  if (typeof window.localStorage !== 'undefined') {
    storage = window.localStorage;
  } else if (typeof localStorage !== 'undefined') {
    storage = localStorage;
  }
  if (storage) {
    const prop = storage.getItem(propertyName);
    if (prop) {
      return JSON.parse(prop);
    }
  }
  return null;
}
