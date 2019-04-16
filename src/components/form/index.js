import './form.module.scss';

import React, { useRef } from 'react';

import cx from 'classnames';

export const FormLabel = ({ animated, children, ...props }) => {
  return (
    <label styleName={cx('form-label', { animated })} {...props}>
      {children}
    </label>
  );
};

export const FormInput = ({
  id,
  type = 'text',
  name,
  required,
  noFocus,
  compact,
  validation = () => '',
  onChange = () => {},
  errorMessage = '',
  ...props
}) => {
  const ref = useRef(null);
  const classes = cx('form-input', {
    'no-focus': noFocus,
    compact
  });
  return (
    <input
      {...props}
      ref={ref}
      id={id}
      type={type}
      name={name}
      styleName={classes}
      required={required}
      spellCheck="false"
      onChange={e => {
        validateInput(e, ref, validation, errorMessage);
        onChange(e);
      }}
    />
  );
};

function validateInput(e, ref, validationFn) {
  if (!ref) return;
  const { value } = e.currentTarget;
  let message = validationFn(value) || '';
  if (message === true) {
    message = '';
  }
  ref.current.setCustomValidity(message);
}

export const FormCheckbox = ({ id, name, label, ...props }) => {
  return (
    <label styleName="form-checkbox">
      <input
        {...props}
        id={id}
        type="checkbox"
        name={name}
        styleName="checkbox"
        spellCheck="false"
      />
      <span styleName="checkbox-label">{label}</span>
    </label>
  );
};

export const FormGroup = ({ children, fluid, column }) => {
  return <div styleName={cx('form-group', { fluid, column })}>{children}</div>;
};
