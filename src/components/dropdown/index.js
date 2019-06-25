import './dropdown.module.scss';

import React, { useCallback, useEffect, useState } from 'react';

import cx from 'classnames';

export default ({ toggleBtn, children }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const onClickBody = useCallback(({ target }) => {
    let { parentElement } = target;
    if (!parentElement) return;
    while (parentElement && parentElement !== document.body) {
      if (parentElement.classList.contains('dropdown-toggle')) {
        return;
      }
      parentElement = parentElement.parentElement;
    }
    setShowDropdown(false);
  }, []);

  useEffect(
    () => {
      if (showDropdown) {
        document.body.addEventListener('click', onClickBody);
      } else {
        document.body.removeEventListener('click', onClickBody);
      }
      return () => document.body.removeEventListener('click', onClickBody);
    },
    [onClickBody, showDropdown]
  );

  return (
    <div styleName="dropdown">
      <div
        styleName={`dropdown-toggle ${showDropdown ? 'shown' : ''}`}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        {toggleBtn}
      </div>

      <div styleName={`dropdown-box ${showDropdown ? 'shown' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export function DropdownList({ children }) {
  return <ul styleName="dropdown-list">{children}</ul>;
}
export function DropdownItem({ children, separated = false }) {
  const classes = cx('dropdown-item', {
    separated
  });
  return <li styleName={classes}>{children}</li>;
}
