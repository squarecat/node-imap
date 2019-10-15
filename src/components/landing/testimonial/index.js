import './testimonial.module.scss';

import HeroTestimonialComponent from './testimonial-bar';
import NewsBarComponent from './news-bar';
import PublicationQuoteComponent from './publication-quote';
import React from 'react';
import TrustBarComponent from './trust-bar';
import cx from 'classnames';

export default ({ text, author, image, ...visProps }) => (
  <div styleName={cx('testimonial', { centered: visProps.centered })}>
    <blockquote styleName="blockquote">
      <p>"{text}"</p>
      <cite styleName="author">
        <img src={image} alt={`${author} avatar`} />
        <span>{author}</span>
      </cite>
    </blockquote>
  </div>
);

export const NewsBar = NewsBarComponent;
export const HeroTestimonial = HeroTestimonialComponent;
export const TrustBar = TrustBarComponent;
export const PublicationQuote = PublicationQuoteComponent;
