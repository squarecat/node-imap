import './wall-of-love.module.scss';

import { StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import React from 'react';

const query = graphql`
  query TweetImagesQuery {
    tweetImages: allFile(
      filter: { sourceInstanceName: { eq: "tweetImages" } }
      sort: { fields: [relativePath], order: ASC }
    ) {
      edges {
        node {
          childImageSharp {
            sizes(maxWidth: 407) {
              ...GatsbyImageSharpSizes
            }
          }
          relativePath
        }
      }
    }
  }
`;

export default ({ rowLimit, colLimit }) => {
  return (
    <>
      <div styleName="tweet-wall">
        <div styleName="tweet-box">
          <StaticQuery
            query={query}
            render={data => {
              const colOne = data.tweetImages.edges.slice(0, 3);
              const colTwo = data.tweetImages.edges.slice(3, 6);
              const colThree = data.tweetImages.edges.slice(6, 9);
              return (
                <>
                  <Col tweets={colOne} />
                  <Col tweets={colTwo} />
                  <Col tweets={colThree} />
                </>
              );
            }}
          />
        </div>
      </div>
    </>
  );
};

const Col = ({ tweets }) => (
  <div styleName="col">
    {tweets.map(({ node }, index) => {
      const handle = /\d+-(.*).png$/.exec(node.relativePath)[1];
      return (
        node.childImageSharp && ( // have to filter out null fields from bad data
          <a
            key={handle}
            styleName="twitter-tweet"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitter.com/${handle}`}
          >
            <Img
              key={`tweet-${index}`}
              sizes={node.childImageSharp.sizes}
              alt={`Testimonial for Leave Me Alone from @${handle}`}
              title={`Leave Me Alone testimonial on Twitter by @${handle}`}
            />
          </a>
        )
      );
    })}
  </div>
);
