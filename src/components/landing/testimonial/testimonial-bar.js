import './testimonial.module.scss';

import Img from 'gatsby-image';
import React from 'react';
import cx from 'classnames';

export default function HeroTestimonial({
  text,
  author,
  image,
  companyName,
  companyLogo
}) {
  const classes = cx('hero-testimonial');
  return (
    <div styleName={classes}>
      <div styleName="image-container">
        <Img loading="auto" fluid={image} alt={`${author} avatar`} />
      </div>
      <blockquote styleName="blockquote">
        <p>"{text}"</p>
      </blockquote>
      <cite styleName="author">
        <span>{author}</span>
        <span styleName="company">
          <span>{companyName}</span>
          <span>{companyLogo}</span>
        </span>
      </cite>
    </div>
  );
}
