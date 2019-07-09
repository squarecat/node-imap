import React, { useEffect } from 'react';

const targetOrigin = process.env.BASE_URL;

export default () => {
  useEffect(() => {
    const params = window.location.search;
    if (window.opener) {
      window.opener.postMessage(
        {
          source: 'lma-login-redirect',
          payload: params
        },
        targetOrigin
      );
      window.close();
    }
  });

  return <p>Redirecting you back to Leave Me Alone. Please wait...</p>;
};
