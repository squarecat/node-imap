import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    if (window.opener) {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      window.opener.postMessage(error ? 'error' : 'done');
      window.close();
    }
  });

  return <p>Please wait...</p>;
};
