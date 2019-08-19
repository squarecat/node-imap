import React, { useEffect, useRef } from 'react';

import styles from './slider.module.scss';

const Slider = React.memo(({ slides }) => {
  const slideRef = useRef(null);
  const clicked = useRef(false);

  const onClick = (e, num) => {
    e.preventDefault();
    clicked.current = true;
    slideRef.current.setAttribute('data-slide', num);
    slideRef.current
      .querySelector(`.${styles.slidesContainer}`)
      .scrollTo(window.innerWidth * num, 0);
    setTimeout(() => {
      clicked.current = false;
    }, 700);
    // change focus for screenreaders
    slideRef.current.querySelector(`[data-index="${num}"]`).focus();
    return false;
  };

  useEffect(() => {
    const el = slideRef.current;
    const slidesEl = el.querySelector(`.${styles.slidesContainer}`);
    const onScroll = () => {
      if (clicked.current) return;
      if (slidesEl.scrollLeft > window.innerWidth * 2 - window.innerWidth / 2) {
        slideRef.current.setAttribute('data-slide', 2);
      } else if (
        slidesEl.scrollLeft >
        window.innerWidth - window.innerWidth / 2
      ) {
        slideRef.current.setAttribute('data-slide', 1);
      } else {
        slideRef.current.setAttribute('data-slide', 0);
      }
    };
    if (el) {
      slidesEl.addEventListener('scroll', onScroll);
    }
    return () => {
      if (el) {
        slidesEl.removeEventListener('scroll', onScroll);
      }
    };
  }, []);

  return (
    <div ref={slideRef} styleName="slider" data-slide="0">
      <div styleName="slides-container">
        {slides.map((slide, i) => (
          <div key={i} data-index={i} tabIndex="-1" styleName="slide">
            {slide}
          </div>
        ))}
      </div>
      <ul styleName="slide-btns">
        <li>
          <a
            href="#"
            aria-label="first testimonial"
            onClick={e => onClick(e, 0)}
          />
        </li>
        <li>
          <a
            href="#"
            aria-label="second testimonial"
            onClick={e => onClick(e, 1)}
          />
        </li>
        <li>
          <a
            href="#"
            aria-label="third testimonial"
            onClick={e => onClick(e, 2)}
          />
        </li>
      </ul>
    </div>
  );
});

export default Slider;
