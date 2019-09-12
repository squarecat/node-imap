import './testimonial.module.scss';

import React, { useMemo } from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import cx from 'classnames';

export default ({ text, author, image, ...visProps }) => (
  <div styleName={cx('testimonial', { centered: visProps.centered })}>
    <blockquote styleName="blockquote">
      <p>"{text}"</p>
      <cite styleName="author">
        <img src={image} alt={`${author} avatar`} />
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
        <Img loading="auto" fluid={image} alt={`${author} avatar`} />
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

const companies = [
  {
    name: 'Toptal'
  },
  {
    name: 'TutorSeek'
  },
  {
    name: 'Product Hunt'
  }
];

export function TrustBar({ label = false, ...visProps }) {
  const styles = cx('trustbar', {
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
                      ...GatsbyImageSharpFluid_withWebp
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
            {companies.map(({ name }, i) => {
              const node =
                data.companyImages.edges[i].node.childImageSharp.fluid;
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
    <div styleName={styles}>
      <div styleName="trustbar-images">{content}</div>
    </div>
  );
}
