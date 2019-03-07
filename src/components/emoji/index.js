import './emoji.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ children, ...visProps }) => {
  const classes = cx('emoji', {
    smaller: visProps.smaller
  });
  return <span styleName={classes}>{children}</span>;
};
