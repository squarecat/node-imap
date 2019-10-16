import './testimonial.module.scss';

import React, { useMemo } from 'react';
import { StaticQuery, graphql } from 'gatsby';
import { TextHighlight, TextLink } from '../../text';

import Img from 'gatsby-image';
import cx from 'classnames';

const PUBLICATIONS = {
  lifehacker: {
    name: 'LifeHacker',
    text: (
      <span>
        You should pay money for Leave Me Alone,{' '}
        <TextHighlight>
          an email unsubscription service that doesn’t sell user data
        </TextHighlight>
        .
      </span>
    )
  },
  fastcompany: {
    name: 'FastCompany',
    text: (
      <span>
        Leave Me Alone{' '}
        <TextHighlight>doesn’t sell your email data to marketers</TextHighlight>{' '}
        as some other unsubscribe services do.
      </span>
    )
  },
  makeuseof: {
    name: 'MakeUseOf',
    text: (
      <span>
        Leave Me Alone is a{' '}
        <TextHighlight>
          privacy-friendly way of doing the same thing that Unroll.me did
        </TextHighlight>{' '}
        while knowing your data is safe.
      </span>
    )
  }
};

export default function PublicationQuote({ publication, ...visProps }) {
  const content = useMemo(() => {
    return (
      <StaticQuery
        query={graphql`
          query {
            lifehacker: file(relativePath: { eq: "news/lifehacker.png" }) {
              childImageSharp {
                fixed(height: 44) {
                  ...GatsbyImageSharpFixed_noBase64
                }
              }
            }
            fastcompany: file(relativePath: { eq: "news/fast-company.png" }) {
              childImageSharp {
                fixed(height: 44) {
                  ...GatsbyImageSharpFixed_noBase64
                }
              }
            }
            makeuseof: file(relativePath: { eq: "news/makeuseof.png" }) {
              childImageSharp {
                fixed(height: 44) {
                  ...GatsbyImageSharpFixed_noBase64
                }
              }
            }
          }
        `}
        render={data => {
          const info = PUBLICATIONS[publication];
          if (!info) return null;
          return (
            <>
              <p styleName="text">{info.text}</p>
              <cite styleName="publication-logo">
                <TextLink as="link" linkTo="/news" undecorated>
                  <span styleName="publication-img">
                    <Img
                      fixed={data[publication].childImageSharp.fixed}
                      alt={`${info.name} logo`}
                    />
                  </span>
                </TextLink>
              </cite>
            </>
          );
        }}
      />
    );
  }, [publication]);

  return (
    <div
      styleName={cx('testimonial publication-quote', {
        centered: visProps.centered,
        bordered: visProps.bordered
      })}
    >
      <blockquote styleName="blockquote">{content}</blockquote>
    </div>
  );
}
