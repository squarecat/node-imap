import { useCallback, useEffect, useState } from 'react';

const useAsync = (fn, args = [], opts = { minWait: 0 }) => {
  const start = Date.now();
  const [state, set] = useState({
    loading: true
  });
  const memoized = useCallback(fn, args);
  useEffect(
    () => {
      let mounted = true;
      const promise = memoized.apply(this, args);

      promise.then(
        value => {
          if (mounted) {
            setTimeout(
              () => {
                set({
                  loading: false,
                  value
                });
              },
              Date.now() - start < opts.minWait ? opts.minWait : 0
            );
          }
        },
        error => {
          if (mounted) {
            setTimeout(
              () => {
                set({
                  loading: false,
                  error
                });
              },
              Date.now() - start < opts.minWait ? opts.minWait : 0
            );
          }
        }
      );

      return () => {
        mounted = false;
      };
    },
    [args, memoized, opts.minWait, start]
  );

  return state;
};

export default useAsync;
