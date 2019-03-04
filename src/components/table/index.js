import './table.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ children }) => {
  const classes = cx('table');
  return (
    <table styleName={classes}>
      <tbody>{children}</tbody>
    </table>
  );
};

export const TableRow = ({ children, inverted, ...props }) => {
  const classes = cx('row', {
    inverted
  });
  return (
    <tr styleName={classes} {...props}>
      {children}
    </tr>
  );
};

export const TableCell = ({ children, ...props }) => {
  const classes = cx('cell');
  return (
    <td styleName={classes} {...props}>
      {children}
    </td>
  );
};
