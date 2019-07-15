import './wall-of-love.module.scss';

import React from 'react';
import TESTIMONIALS from './testimonials';
import _shuffle from 'lodash.shuffle';

const BASE_IMG_URL = `${process.env.CDN_URL}/images/testimonials`;

export default () => {
  return (
    <div styleName="testimonials">
      {_shuffle(TESTIMONIALS).map((testimonial, index) => {
        return <Box key={index} testimonial={testimonial} />;
      })}
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
