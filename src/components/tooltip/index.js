import 'rc-tooltip/assets/bootstrap_white.css';

import React from 'react';
import Tooltip from 'rc-tooltip';
import cx from 'classnames';
import styles from './tooltip.module.scss';

export default ({ children, overlay, placement = 'top', white, progress }) => {
  const classes = cx(styles.tooltip, {
    [styles.white]: white,
    [styles.progress]: progress
  });
  return (
    <Tooltip
      placement={placement}
      trigger={['hover', 'click']}
      mouseLeaveDelay={0}
      overlayClassName={classes}
      destroyTooltipOnHide={true}
      overlay={overlay}
    >
      {children}
    </Tooltip>
  );
};
