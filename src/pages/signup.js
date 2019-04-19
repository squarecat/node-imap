import LoginPage from './login';
import React from 'react';

export default ({ transitionStatus }) => {
  return <LoginPage register={true} transitionStatus={transitionStatus} />;
};
