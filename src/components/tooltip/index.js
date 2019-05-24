import 'rc-tooltip/assets/bootstrap_white.css';

import React from 'react';
import Tooltip from 'rc-tooltip';
import cx from 'classnames';
import styles from './tooltip.module.scss';

export default ({ children, overlay, placement = 'top', white }) => {
  const classes = cx(styles.tooltip, {
    [styles.white]: white
  });
  return (
    <Tooltip
      placement={placement}
      trigger={['hover']}
      mouseLeaveDelay={0}
      overlayClassName={classes}
      destroyTooltipOnHide={false}
      overlay={overlay}
    >
      {children}
    </Tooltip>
  );
};
