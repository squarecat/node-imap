import './form.module.scss';

import React from 'react';
import cx from 'classnames';

export const FormLabel = ({ animated, children, ...props }) => {
  return (
    <label styleName={cx('form-label', { animated })} {...props}>
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

export const FormCheckbox = ({ id, name, label, ...props }) => {
  return (
    <label>
      <input
        {...props}
        id={id}
        type="checkbox"
        name={name}
        styleName="form-checkbox"
      />
      <span styleName="checkbox-label">{label}</span>
    </label>
  );
};

export const FormGroup = ({ children }) => {
  return <div styleName="form-group">{children}</div>;
};
