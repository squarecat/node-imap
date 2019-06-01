import React from 'react';
import cx from 'classnames';
import styles from './spinner.module.scss';

export default ({ shown }) => {
  const classes = cx(styles.spinner, {
    [styles.shown]: shown
  });
  return <span className={classes} />;
};
