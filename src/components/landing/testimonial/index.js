import './testimonial.module.scss';

import React, { useMemo } from 'react';

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
        <img src={image} />
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
  const styles = cx('trustbar', visProps);
  const content = useMemo(
    () => {
      return (
        <>
          {label ? (
            <span styleName="trustbar-label">
              Used by<span styleName="long-text"> employees at</span>:
            </span>
          ) : null}
          {logos.map((logo, i) => (
            <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
              <img src={logo} alt="trusted provider logo" />
            </span>
          ))}
        </>
      );
    },
    [label, logos]
  );
  return (
    <div styleName={styles}>
      <div styleName="trustbar-images">{content}</div>
    </div>
  );
}
