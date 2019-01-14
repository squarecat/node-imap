import React, { useEffect, useState } from 'react';

import { fetchLoggedInUser } from '../utils/auth';
import { useAsync, useLoader } from '../utils/hooks';
import Loading from './loading';
import useUser from '../utils/hooks/use-user';
import './auth.css';

export default ({ children }) => {
  const { error, value: user, loading: userLoading } = useAsync(
    fetchLoggedInUser,
    [],
    {
      minWait: 2000
    }
  );
  const [, { load }] = useUser(s => s.loaded);

  useEffect(
    () => {
      if (!userLoading && !user) {
        window.location.pathname = '/login';
      } else if (!userLoading && user) {
        load(user);
      }
    },
    [userLoading]
  );

  if (error) {
    return <span>{error}</span>;
  }
  return <UserAuth>{children}</UserAuth>;
};

function UserAuth({ children }) {
  const [isUserLoaded] = useUser(s => s.loaded);
  const [isLoading, { setLoading }] = useLoader();

  useEffect(
    () => {
      if (isUserLoaded) {
        setLoading(false);
      } else {
        setLoading(true);
      }
    },
    [isUserLoaded]
  );

  return (
    <div className={`auth-loading ${isLoading ? '' : 'auth-loading--loaded'}`}>
      <Loading />
      <div className="loaded-content">{!isLoading ? children : null}</div>
    </div>
  );
}
