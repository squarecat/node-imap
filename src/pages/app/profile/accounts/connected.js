import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    if (window.opener) {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      if (error) {
        const reason = urlParams.get('reason');
        window.opener.postMessage({
          error: reason,
          success: false
        });
      } else {
        window.opener.postMessage({
          error: null,
          success: true
        });
      }
      window.close();
    }
  });

  return <p>Please wait...</p>;
};
