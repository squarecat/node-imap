import './wall-of-love.module.scss';

import React, { useEffect, useMemo, useState } from 'react';

import _shuffle from 'lodash.shuffle';
import testimonialData from './testimonials';
import useMedia from 'react-use/lib/useMedia';

const BASE_IMG_URL = `${process.env.CDN_URL}/images/testimonials`;

export default () => {
  const isMobile = useMedia('(max-width: 768px)');
  const isTablet = useMedia('(max-width: 900px)');
  // const isDesktop = useMedia('(max-width: 1024px)');

  const [data, setData] = useState([]);

  useEffect(() => {
    const shuffled = _shuffle(testimonialData);
    setData(shuffled);
  }, []);

  const columns = useMemo(
    () => {
      if (isMobile) {
        return getCols(data, 1);
      }
      if (isTablet) {
        return getCols(data, 2);
      }
      return getCols(data);
    },
    [isMobile, isTablet, data]
  );

  const content = useMemo(
    () => {
      return columns.map((col, index) => (
        <div styleName="col" key={`col-${index}`}>
          {col.map(testimonial => (
            <Box key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      ));
    },
    [columns]
  );

  return <div styleName="testimonials">{content}</div>;
};

function Box({ testimonial }) {
  const { name, text, twitter, avatarPath, company } = testimonial;

  const avatarLetter = name
    .split(' ')
    .map(a => a[0])
    .slice(0, 2)
    .join('');

  return (
    <div styleName="wrapper">
      <div styleName="box">
        <div styleName="img">
          {avatarPath ? (
            <img src={`${BASE_IMG_URL}/${avatarPath}`} />
          ) : (
            <span styleName="avatar-letter">{avatarLetter}</span>
          )}
        </div>
        <div styleName="content">
          <p styleName="text">{text}</p>
          <div styleName="name-container">
            {twitter ? (
              <a
                href={`https://twitter.com/${twitter}`}
                styleName="twitter-link"
              >
                <span styleName="name">{name}</span>
              </a>
            ) : (
              <span styleName="name">{name}</span>
            )}
            {company ? (
              <div styleName="company-container">{company}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getCols(data, limit = 3) {
  if (limit === 1) {
    return [[...data]];
  }

  if (limit === 2) {
    return data.reduce(
      (out, testimonial, index) => {
        if (index % 2 === 0) {
          return [out[0], [...out[1], testimonial]];
        }
        return [[...out[0], testimonial], out[1]];
      },
      [[], []]
    );
  }

  return data.reduce(
    (out, testimonial, index) => {
      if (index % 3 === 2) {
        return [out[0], out[1], [...out[2], testimonial]];
      }
      if (index % 2 === 1) {
        return [out[0], [...out[1], testimonial], out[2]];
      }
      return [[...out[0], testimonial], out[1], out[2]];
    },
    [[], [], []]
  );
}
