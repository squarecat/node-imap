import './form.module.scss';

import React, { useEffect, useRef, useState } from 'react';

import cx from 'classnames';

export const FormLabel = ({ animated, inline, children, ...props }) => {
  return (
    <label styleName={cx('form-label', { animated, inline })} {...props}>
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
  smaller,
  basic,
  validation = () => '',
  onChange = () => {},
  errorMessage = '',
  value = '',
  ...props
}) => {
  const ref = useRef(null);
  const [inputValue, setInputValue] = useState(value);
  useEffect(
    () => {
      setInputValue(value);
    },
    [value]
  );
  const classes = cx('form-input', {
    'no-focus': noFocus,
    'input-compactt': compact,
    'input-smaller': smaller,
    'input-basic': basic
  });
  return (
    <input
      {...props}
      value={inputValue}
      ref={ref}
      id={id}
      type={type}
      name={name}
      styleName={classes}
      required={required}
      spellCheck="false"
      onChange={e => {
        setInputValue(e.currentTarget.value);
        validateInput(e, ref, validation, errorMessage);
        onChange(e);
      }}
    />
  );
};

export const InlineFormInput = ({ children, ...props }) => {
  return (
    <span styleName="inline-input">
      <FormInput {...props} />
      {children}
    </span>
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

export const FormSelect = ({
  id,
  name,
  required,
  compact,
  smaller,
  pill,
  basic,
  validation = () => '',
  onChange = () => {},
  errorMessage = '',
  options = [],
  value = '',
  placeholder,
  ...props
}) => {
  const ref = useRef(null);
  const classes = cx('form-input form-select-dropdown', {
    'input-compactt': compact,
    'input-basic': basic,
    'input-smaller': smaller,
    pill: pill
  });
  const selected = options.find(o => o.value === value);
  const selectedLabel = selected ? selected.label : placeholder;
  return (
    <span styleName="select-wrapper">
      <span styleName={classes}>{selectedLabel}</span>
      <select
        {...props}
        ref={ref}
        id={id}
        name={name}
        value={value}
        styleName="select"
        required={required}
        spellCheck="false"
        onChange={e => {
          validateInput(e, ref, validation, errorMessage);
          onChange(e);
        }}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}

        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </span>
  );
};

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

export const FormGroup = ({ children, fluid, column, container }) => {
  return (
    <div styleName={cx('form-group', { fluid, column, container })}>
      {children}
    </div>
  );
};

export const FormNotification = ({ children, error, warning, success }) => (
  <div
    styleName={cx('form-notification', {
      error,
      warning,
      success
    })}
  >
    <p>{children}</p>
  </div>
);
