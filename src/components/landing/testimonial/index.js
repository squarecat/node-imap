import './testimonial.module.scss';

import HeroTestimonialComponent from './testimonial-bar';
import NewsBarComponent from './news-bar';
import React from 'react';
import TrustBarComponent from './trust-bar';
import cx from 'classnames';
import { Link } from 'gatsby';
import { TextLink } from '../../text';

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

export const PublicationQuote = ({ text, image, name, ...visProps }) => (
  <div
    styleName={cx('testimonial publication-quote', {
      centered: visProps.centered
    })}
  >
    <blockquote styleName="blockquote">
      <p>"{text}"</p>
      <cite styleName="publication-logo">
        <TextLink as="link" linkTo="/news" undecorated>
          <span styleName="newsbar-img">
            <img src={image} alt={`${name} logo`} />
          </span>
        </TextLink>
      </cite>
    </blockquote>
  </div>
);

export const NewsBar = NewsBarComponent;
export const HeroTestimonial = HeroTestimonialComponent;
export const TrustBar = TrustBarComponent;
