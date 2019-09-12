import './testimonial.module.scss';

import React, { useMemo } from 'react';

import Img from 'gatsby-image';
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

export function HeroTestimonial({
  text,
  author,
  image,
  companyName,
  companyLogo
}) {
  const styles = cx('hero-testimonial');
  return (
    <div styleName={styles}>
      <div styleName="image-container">
        <Img critical fluid={image} alt={`${author} avatar`} />
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

export function TrustBar({ logos = [], label = false, ...visProps }) {
  const styles = cx('trustbar', {
    dark: visProps.dark,
    spaced: visProps.spaced
  });
  const content = useMemo(() => {
    return (
      <>
        {label ? (
          <span styleName="trustbar-label">
            Used by<span styleName="long-text"> employees at</span>:
          </span>
        ) : null}
        {logos.map(({ name, link }, i) => (
          <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
            <img src={link} alt={`${name} logo`} />
          </span>
        ))}
      </>
    );
  }, [label, logos]);
  return (
    <div styleName={styles}>
      <div styleName="trustbar-images">{content}</div>
    </div>
  );
}
