import './testimonial.module.scss';

import React, { useMemo } from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import cx from 'classnames';

const companies = [
  {
    name: 'Toptal',
    path: 'toptal'
  },
  {
    name: 'TutorSeek',
    path: 'tutorseek'
  },
  {
    name: 'Product Hunt',
    path: 'product-hunt'
  }
];

export default function TrustBar({ label = false, ...visProps }) {
  const classes = cx('trustbar', {
    dark: visProps.dark,
    spaced: visProps.spaced
  });
  const content = useMemo(() => {
    return (
      <StaticQuery
        query={graphql`
          query {
            companyImages: allFile(
              filter: { relativePath: { glob: "companies/*" } }
            ) {
              edges {
                node {
                  name
                  childImageSharp {
                    fluid(maxHeight: 42) {
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
            {label ? (
              <span styleName="trustbar-label">
                Used by<span styleName="long-text"> employees at</span>:
              </span>
            ) : null}
            {companies.map(({ name, path }, i) => {
              const edges = data.companyImages.edges;
              const edge = edges.find(e => e.node.name === path);
              const node = edge.node.childImageSharp.fluid;
              return (
                <span key={`trustbar-logo-${i}`} styleName="trustbar-img">
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
  }, [label]);
  return (
    <div styleName={classes}>
      <div styleName="trustbar-images">{content}</div>
    </div>
  );
}
