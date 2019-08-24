import './form.module.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';

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

export const InlineFormInput = ({
  children,
  childrenPosition = 'right',
  ...props
}) => {
  const inline = <span styleName="inline-input-wrapper">{children}</span>;
  return (
    <span styleName="inline-input" data-position={childrenPosition}>
      <FormInput {...props} />
      {inline}
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
  const selected = useMemo(() => findSelectedOption(options, value), [
    options,
    value
  ]);
  const selectedLabel = selected ? selected.label : placeholder;

  const classes = cx('form-input form-select-dropdown', {
    'input-compactt': compact,
    'input-basic': basic,
    'input-smaller': smaller,
    pill: pill,
    placeholder: !selected
  });

  return (
    <span styleName={cx('select-wrapper', { inline: pill })}>
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

        {options.map(opt => {
          if (opt.options) {
            return (
              <optgroup key={opt.label} label={opt.label}>
                {opt.options.map(o => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            );
          }
          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
      <span styleName={classes}>{selectedLabel}</span>
    </span>
  );
};

function findSelectedOption(options, value) {
  return options.reduce((out, option) => {
    if (out) {
      // already found
      return out;
    }
    if (option.options) {
      return option.options.find(o => o.value === value);
    }
    return option.value === value ? option : null;
  }, null);
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

export const FormTextarea = ({
  id,
  name,
  required,
  rows = '2',
  onChange = () => {},
  value = '',
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value);
  useEffect(
    () => {
      setInputValue(value);
    },
    [value]
  );
  const classes = cx('form-textarea');
  return (
    <textarea
      {...props}
      id={id}
      value={inputValue}
      name={name}
      rows={rows}
      styleName={classes}
      required={required}
      spellCheck="false"
      onChange={e => {
        setInputValue(e.currentTarget.value);
        onChange(e);
      }}
    />
  );
};

export const FormGroup = ({ children, fluid, container, unpadded }) => {
  return (
    <div
      styleName={cx('form-group', {
        fluid,
        container,
        unpadded
      })}
    >
      {children}
    </div>
  );
};

export const FormNotification = ({
  children,
  error,
  warning,
  success,
  info,
  ...visProps
}) => (
  <div
    styleName={cx('form-notification', {
      error,
      warning,
      success,
      info,
      fluid: visProps.fluid
    })}
  >
    <span>{children}</span>
  </div>
);
