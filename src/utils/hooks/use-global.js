import { useState, useEffect } from 'react';
let globals = {};

const useLocalStorage = propertyName => {
  const [state, setState] = useState(globals);

  useEffect(
    () => {
      globals = {
        ...globals,
        [propertyName]: state[propertyName]
      };
    },
    [state[propertyName]]
  );

  function set(value) {
    setState({
      ...state,
      [propertyName]: value
    });
  }

  return [state[propertyName], set];
};

export default useLocalStorage;
