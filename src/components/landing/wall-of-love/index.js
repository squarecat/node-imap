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
    <div>
      <div styleName="header">
        {/* <h2>Wall of love</h2>
        <p>
          Our users are awesome and they think we're awesome too. Take a look at
          all the nice things they've said about us!
        </p> */}
        <a
          styleName="ph-badge"
          href="https://www.producthunt.com/posts/leave-me-alone-3?utm_source=badge-top-post-badge"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=143797&theme=light"
            alt="Leave Me Alone - Easily unsubscribe from spam emails 💌 | #1 Product of the Day Product Hunt Embed"
            style={{ width: 250, height: 54 }}
            width="250px"
            height="54px"
          />
        </a>
        <a
          styleName="ph-badge"
          href="https://www.producthunt.com/posts/leave-me-alone-3?utm_source=badge-top-post-badge&utm_medium=badge&utm_souce=badge-leave-me-alone-3"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=143797&theme=light&period=weekly"
            alt="Leave Me Alone - Easily unsubscribe from spam emails 💌 | #1 Product of the Week Product Hunt Embed"
            style={{ width: 250, height: 54 }}
            width="250px"
            height="54px"
          />
        </a>
      </div>
      <div styleName="tweet-wall">
        <div styleName="tweet-box">
          <StaticQuery
            query={query}
            render={data => {
              const colOne = data.tweetImages.edges.slice(0, 2);
              const colTwo = data.tweetImages.edges.slice(2, 4);
              const colThree = data.tweetImages.edges.slice(4, 6);
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
