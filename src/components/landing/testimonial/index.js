import './testimonial.module.scss';

import React from 'react';

export default ({ text, author, image }) => (
  <div styleName="testimonial">
    <blockquote styleName="blockquote">
      <p>"{text}"</p>
      <cite styleName="author">
        <img src={image} />
        <span>{author}</span>
      </cite>
    </blockquote>
  </div>
);
