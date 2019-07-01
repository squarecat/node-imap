import React, { useEffect } from 'react';

const targetOrigin = process.env.BASE_URL;

export default () => {
  useEffect(() => {
    if (window.opener) {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      if (error) {
        const reason = urlParams.get('reason');
        window.opener.postMessage(
          {
            source: 'lma-connect-redirect',
            payload: {
              error: reason,
              success: false
            }
          },
          targetOrigin
        );
      } else {
        window.opener.postMessage(
          {
            source: 'lma-connect-redirect',
            payload: {
              error: null,
              success: true
            }
          },
          targetOrigin
        );
      }
      window.close();
    }
  });

  return <p>Redirecting you back to Leave Me Alone. Please wait...</p>;
};
