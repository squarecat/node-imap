import React from 'react';
import { graphql, StaticQuery } from 'gatsby';
import Img from 'gatsby-image';

import './wall-of-love.css';

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

export default () => {
  return (
    <div>
      <div className="wall-of-love-header">
        <h2>💌 Wall of love 💌</h2>
        <p>
          Our users are awesome and they think we're awesome too. Take a look at
          all the nice things they've said about us!
        </p>
      </div>
      <div className="tweet-wall">
        <div className="tweet-box">
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
    </div>
  );
};

const Col = ({ tweets }) => (
  <div className="col">
    {tweets.map(({ node }, index) => {
      const handle = /\d+-(.*).png$/.exec(node.relativePath)[1];
      return (
        node.childImageSharp && ( // have to filter out null fields from bad data
          <a
            key={handle}
            className="twitter-tweet"
            target="_blank"
            rel="noopener noreferrer"
            href={`https://twitter.com/${handle}`}
          >
            <Img key={`tweet-${index}`} sizes={node.childImageSharp.sizes} />
          </a>
        )
      );
    })}
  </div>
);
