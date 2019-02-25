import './form.module.scss';

import React from 'react';

export const FormLabel = ({ children, ...props }) => {
  return (
    <label styleName="form-label" {...props}>
      {children}
    </label>
  );
};

export const FormInput = ({ id, type = 'text', name, required, ...props }) => {
  return (
    <input
      {...props}
      id={id}
      type={type}
      name={name}
      styleName="form-input"
      required={required}
    />
  );
};

export const FormGroup = ({ children }) => {
  return <div styleName="form-group">{children}</div>;
};
