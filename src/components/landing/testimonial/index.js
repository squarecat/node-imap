import './testimonial.module.scss';

import React from 'react';
import cx from 'classnames';

export default ({ text, author, image, ...visProps }) => (
  <div styleName={cx('testimonial', { centered: visProps.centered })}>
    <blockquote styleName="blockquote">
      <p>"{text}"</p>
      <cite styleName="author">
        <img src={image} />
        <span>{author}</span>
      </cite>
    </blockquote>
  </div>
);
