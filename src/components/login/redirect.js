import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    const params = window.location.search;
    if (window.opener) {
      window.opener.postMessage({
        source: 'lma-login-redirect',
        payload: params
      });
      window.close();
    }
  });

  return <p>Please wait...</p>;
};
