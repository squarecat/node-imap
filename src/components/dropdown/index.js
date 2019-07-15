import './dropdown.module.scss';

import React, { useCallback, useEffect, useState } from 'react';

import cx from 'classnames';

export default ({ toggleBtn, toggleEvent = 'click', children, style }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const onClickBody = useCallback(e => {
    let { parentElement } = e.target;
    if (e.target.getAttribute('data-dropdown-container')) {
      // click on the toggle that showned it
      // means close it
      setShowDropdown(false);
      e.stopPropagation();
    } else if (e.target.tagName === 'INPUT' || !parentElement) {
      return;
    }
    while (parentElement && parentElement !== document.body) {
      if (parentElement.getAttribute('data-dropdown-content')) {
        return e.stopPropagation();
      }
      parentElement = parentElement.parentElement;
    }
    setShowDropdown(false);
    e.stopPropagation();
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
    <div
      styleName="dropdown"
      {...props}
      data-dropdown
      data-shown={showDropdown}
    >
      <div
        data-dropdown-toggle
        styleName={`dropdown-toggle ${showDropdown ? 'shown' : ''}`}
      >
        {toggleBtn}
      </div>
      <div
        {...props}
        data-dropdown-container
        styleName={`dropdown-box-container ${showDropdown ? 'shown' : ''}`}
      >
        <div styleName="dropdown-box" data-dropdown-content style={style}>
          {children}
        </div>
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
