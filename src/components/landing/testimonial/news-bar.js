import React, { useMemo } from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import styles from './testimonial.module.scss';

const companies = [
  {
    name: 'LifeHacker',
    path: 'lifehacker'
  },
  {
    name: 'FastCompany',
    path: 'fast-company'
  },
  {
    name: 'MakerMag',
    path: 'makermag'
  }
];

export default function NewsBar() {
  const content = useMemo(() => {
    return (
      <StaticQuery
        query={graphql`
          query {
            newsImages: allFile(filter: { relativePath: { glob: "news/*" } }) {
              edges {
                node {
                  name
                  childImageSharp {
                    fluid(maxHeight: 32) {
                      presentationWidth
                      ...GatsbyImageSharpFluid_noBase64
                    }
                  }
                }
              }
            }
          }
        `}
        render={data => (
          <>
            {companies.map(({ name, path }, i) => {
              const edges = data.newsImages.edges;
              const edge = edges.find(e => e.node.name === path);
              const node = edge.node.childImageSharp.fluid;
              return (
                <span
                  key={`trustbar-logo-${i}`}
                  styleName="trustbar-img newsbar-img"
                >
                  <Img
                    style={{
                      width: node.presentationWidth
                    }}
                    fluid={node}
                    alt={`${name} logo`}
                  />
                </span>
              );
            })}
          </>
        )}
      />
    );
  }, []);
  return (
    <div className={styles.newsBar}>
      <span styleName="trustbar-label news-bar-label">Featured in</span>
      <div styleName="trustbar-images news-bar-images">{content}</div>
    </div>
  );
}
