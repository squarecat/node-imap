import { useState } from 'react';
let globals = {};

const useLocalStorage = propertyName => {
  const [state, setState] = useState(globals);

  function set(value) {
    setState({
      ...state,
      [propertyName]: value
    });
    globals = {
      ...globals,
      [propertyName]: value
    };
  }

  return [state[propertyName], set];
};

export default useLocalStorage;
