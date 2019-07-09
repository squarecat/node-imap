import './dropdown.module.scss';

import React, { useCallback, useEffect, useState } from 'react';

import cx from 'classnames';

export default ({ toggleBtn, toggleEvent = 'click', children }) => {
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
      if (toggleEvent === 'click') {
        if (showDropdown) {
          document.body.addEventListener('click', onClickBody);
        } else {
          document.body.removeEventListener('click', onClickBody);
        }
      }
      return () => document.body.removeEventListener('click', onClickBody);
    },
    [onClickBody, showDropdown, toggleEvent]
  );

  let props;
  if (toggleEvent === 'click') {
    props = {
      onClick: () => setShowDropdown(!showDropdown)
    };
  } else if (toggleEvent === 'hover') {
    props = {
      onClick: () => setShowDropdown(true),
      onMouseEnter: () => setShowDropdown(true),
      onMouseLeave: () => setShowDropdown(false)
    };
  }

  return (
    <div styleName="dropdown" {...props} data-dropdown>
      <div styleName={`dropdown-toggle ${showDropdown ? 'shown' : ''}`}>
        {toggleBtn}
      </div>
      <div
        {...props}
        styleName={`dropdown-box-container ${showDropdown ? 'shown' : ''}`}
      >
        <div styleName="dropdown-box">{children}</div>
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
