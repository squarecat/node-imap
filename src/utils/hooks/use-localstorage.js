import { useEffect, useState } from 'react';

const useLocalStorage = propertyName => {
  const [property, setProperty] = useState(null);

  // on mount fetch the prop from localstorage
  useEffect(() => {
    let storage;
    if (!typeof window.localStorage === 'undefined') {
      storage = window.localStorage;
    } else if (!typeof localStorage === 'undefined') {
      storage = localStorage;
    }
    if (storage) {
      const prop = storage.getItem(propertyName);
      if (prop) {
        setProperty(JSON.parse(prop));
      }
    }
  }, []);
  // on set, set on localstorage, and update the state
  function set(value) {
    setProperty(value);
    localStorage.setItem(propertyName, value);
  }

  return [property, set];
};

export default useLocalStorage;
