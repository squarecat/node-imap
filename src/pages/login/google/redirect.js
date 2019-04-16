import React, { useEffect } from 'react';

export default () => {
  useEffect(() => {
    const params = window.location.search;
    if (window.opener) {
      window.opener.postMessage(params);
      window.close();
    }
  });

  return <p>Please wait...</p>;
};
