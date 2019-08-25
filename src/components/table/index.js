import './table.module.scss';

import React from 'react';
import cx from 'classnames';

export default React.memo(({ children }) => {
  const classes = cx('table');
  return <table styleName={classes}>{children}</table>;
});

export const TableRow = React.memo(({ children, inverted, ...props }) => {
  const classes = cx('row', {
    inverted
  });
  return (
    <tr styleName={classes} {...props}>
      {children}
    </tr>
  );
});

export const TableCell = React.memo(({ children, ...props }) => {
  const classes = cx('cell');
  return (
    <td styleName={classes} {...props}>
      {children}
    </td>
  );
});

export const TableHead = React.memo(({ children }) => {
  return (
    <thead styleName="head">
      <tr>{children}</tr>
    </thead>
  );
});

export const TableHeadCell = React.memo(({ children }) => {
  return <th styleName="head-cell">{children}</th>;
});
