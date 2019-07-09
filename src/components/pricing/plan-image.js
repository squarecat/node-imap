import './plan-image.module.scss';

import React from 'react';
import cx from 'classnames';
import packageImg from '../../assets/package.png';
import stampImg from '../../assets/stamp.png';
import truckImg from '../../assets/truck.png';

export default ({ type, ...visProps }) => {
  const classes = cx('image', {
    compact: visProps.compact,
    smaller: visProps.smaller
  });

  let image;
  switch (type) {
    case 'usage-based': {
      image = stampImg;
      break;
    }
    case 'package': {
      image = packageImg;
      break;
    }
    case 'enterprise': {
      image = truckImg;
      break;
    }
  }
  return <img styleName={classes} src={image} />;
};
