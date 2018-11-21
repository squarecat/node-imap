import { useEffect } from 'react';

const useOnMount = onMount =>
  useEffect(() => {
    onMount && onMount();
  }, []);

export default useOnMount;
