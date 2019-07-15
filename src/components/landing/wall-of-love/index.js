import './wall-of-love.module.scss';

import React from 'react';
import _shuffle from 'lodash.shuffle';
import testimonialData from './testimonials';

const BASE_IMG_URL = `${process.env.CDN_URL}/images/testimonials`;

export default () => {
  const columns = _shuffle(testimonialData).reduce(
    (out, testimonial, index) => {
      if (index % 3 === 0) {
        return [out[0], out[1], [...out[2], testimonial]];
      }
      if (index % 2 === 0) {
        return [out[0], [...out[1], testimonial], out[2]];
      }
      return [[...out[0], testimonial], out[1], out[2]];
    },
    [[], [], []]
  );
  return (
    <div styleName="testimonials">
      {columns.map((col, index) => (
        <div styleName="col" key={`col-${index}`}>
          {col.map(testimonial => (
            <Box key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>
      ))}
    </div>
  );
};

function Box({ testimonial }) {
  const { name, text, twitter, avatarPath } = testimonial;
  const avatarUrl = `${BASE_IMG_URL}/${avatarPath}.jpg`;

  return (
    <div styleName="wrapper">
      <div styleName="box">
        <div styleName="img">
          <img src={avatarUrl} />
        </div>
        <div styleName="content">
          <p styleName="text">{text}</p>
          {twitter ? (
            <a href={`https://twitter.com/${twitter}`} styleName="twitter-link">
              <span styleName="name">{name}</span>
            </a>
          ) : (
            <span styleName="name">{name}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// const Col = ({ tweets }) => (
//   <div styleName="col">
//     {tweets.map(({ node }, index) => {
//       const handle = /\d+-(.*).png$/.exec(node.relativePath)[1];
//       return (
//         node.childImageSharp && ( // have to filter out null fields from bad data
//           <a
//             key={handle}
//             styleName="twitter-tweet"
//             target="_blank"
//             rel="noopener noreferrer"
//             href={`https://twitter.com/${handle}`}
//           >
//             <Img
//               key={`tweet-${index}`}
//               sizes={node.childImageSharp.sizes}
//               alt={`Testimonial for Leave Me Alone from @${handle}`}
//               title={`Leave Me Alone testimonial on Twitter by @${handle}`}
//             />
//           </a>
//         )
//       );
//     })}
//   </div>
// );
