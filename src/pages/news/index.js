import './news.module.scss';

import React, { useMemo } from 'react';
import { StaticQuery, graphql } from 'gatsby';

import Img from 'gatsby-image';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';
import cx from 'classnames';

const InTheNewsPage = () => {
  return (
    <SubPageLayout
      title="In The News"
      description={`Read about Leave Me Alone featured in news articles around the world.`}
      slug="/news"
    >
      <h1 styleName="title">In The News</h1>
      <News />
      <div styleName="end-stuff">
        <h2>Want to know more?</h2>
        <p>
          Check out{' '}
          <TextLink as="link" linkTo="/learn">
            how it works
          </TextLink>
          , read about our{' '}
          <TextLink as="link" linkTo="/security">
            security
          </TextLink>
          , and find out more{' '}
          <TextLink as="link" linkTo="/about">
            about us and our mission
          </TextLink>
          .
        </p>
        <p style={{ margin: '50px auto' }}>Or...</p>
        <a
          event="clicked-news-cta"
          href={`/signup`}
          className={`beam-me-up-cta beam-me-up-cta-center beam-me-up-cta-invert`}
        >
          Sign Up Now!
        </a>
      </div>
    </SubPageLayout>
  );
};

function News() {
  const content = useMemo(() => {
    return (
      <StaticQuery
        query={graphql`
          {
            featuredNews: allAirtable(
              filter: {
                table: { eq: "News" }
                data: { Featured: { eq: true } }
              }
              sort: { fields: data___ID }
            ) {
              edges {
                node {
                  data {
                    ID
                    Featured
                    Publication
                    Quote
                    Article_URL
                    Logo {
                      localFiles {
                        childImageSharp {
                          fixed(height: 44) {
                            ...GatsbyImageSharpFixed_noBase64
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            categorisedNews: allAirtable(
              filter: {
                table: { eq: "News" }
                data: { Featured: { ne: true } }
              }
              sort: { fields: data___ID }
            ) {
              edges {
                node {
                  data {
                    ID
                    Featured
                    Title
                    Publication
                    Article_URL
                    Type
                    Logo {
                      localFiles {
                        childImageSharp {
                          fixed(height: 44) {
                            ...GatsbyImageSharpFixed_noBase64
                          }
                        }
                      }
                    }
                    Cover_Image {
                      localFiles {
                        childImageSharp {
                          fluid(maxWidth: 450) {
                            ...GatsbyImageSharpFluid_withWebp
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `}
        render={data => {
          const { edges: featuredNews } = data.featuredNews;
          const { edges: categorisedNews } = data.categorisedNews;

          const {
            caseStudies,
            directories,
            lmaInterviews,
            other
          } = categoriseNews(categorisedNews);

          return (
            <>
              <div styleName="list">
                {featuredNews.map(({ node }) => {
                  const item = mapItem(node.data);
                  return <FeaturedItem key={item.id} {...item} />;
                })}
              </div>

              <Section
                title="Case Studies"
                lead="Read more from our customers about the impact Leave Me Alone
                  has had on their inboxes."
                news={caseStudies}
              />

              <Section
                title="Behind the Scenes"
                lead="First-hand accounts from Danielle and James on how Leave Me
                  Alone was created."
                news={lmaInterviews}
              />

              <Section
                title="Recommendations"
                lead="Leave Me Alone is listed among other top products in all of
                  these directories."
                news={directories}
              />

              <Section
                title="Extras"
                lead="Plus, we are mentioned in all of these places too!"
                news={other}
              />
            </>
          );
        }}
      />
    );
  }, []);

  return content;
}

function Section({ title, lead, news }) {
  return (
    <div styleName="section">
      <h2>{title}</h2>
      <p>{lead}</p>
      <div styleName="cards">
        {news.map(item => (
          <CardItem key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

function FeaturedItem({ name, quote, url, logo }) {
  return (
    <div styleName="item">
      <p>"{quote}"</p>
      <a target="_" styleName="logo" href={url}>
        <Img
          fixed={logo.localFiles[0].childImageSharp.fixed}
          alt={`${name} logo`}
        />
      </a>
    </div>
  );
}

function CardItem({ title, publication, url, coverImg, logo }) {
  const logoContent = useMemo(() => {
    if (!logo || !logo.localFiles) return null;
    return (
      <span styleName="card-logo">
        <Img
          fixed={logo.localFiles[0].childImageSharp.fixed}
          alt={`${publication} logo`}
        />
      </span>
    );
  }, [logo, publication]);

  const publicationContent = useMemo(() => {
    if (!title || logo) return null;
    return <span styleName="card-publication">{publication}</span>;
  }, [title, logo, publication]);

  return (
    <div styleName="card">
      {coverImg ? (
        <div
          styleName={cx('card-image', {
            darkened: !!title
          })}
        >
          <Img
            fluid={coverImg.localFiles[0].childImageSharp.fluid}
            alt={`${publication} cover image`}
          />
        </div>
      ) : null}
      <div styleName="card-content">
        <a href={url} target="_">
          {logoContent}
          {title ? <h3 styleName="card-title">{title}</h3> : null}
          {publicationContent}
        </a>
      </div>
    </div>
  );
}

export default InTheNewsPage;

function categoriseNews(edges) {
  return edges.reduce(
    (out, { node }) => {
      const newsItem = mapItem(node.data);
      if (newsItem.type === 'Case Study') {
        return {
          ...out,
          caseStudies: [...out.caseStudies, newsItem]
        };
      }
      if (newsItem.type === 'Directory') {
        return {
          ...out,
          directories: [...out.directories, newsItem]
        };
      }
      if (newsItem.type === 'LMA Interview') {
        return {
          ...out,
          lmaInterviews: [...out.lmaInterviews, newsItem]
        };
      }
      return {
        ...out,
        other: [...out.other, newsItem]
      };
    },
    {
      caseStudies: [],
      directories: [],
      lmaInterviews: [],
      other: []
    }
  );
}

function mapItem(item) {
  return {
    id: item.ID,
    title: item.Title,
    publication: item.Publication,
    quote: item.Quote,
    url: item.Article_URL,
    type: item.Type,
    logo: item.Logo,
    coverImg: item.Cover_Image
  };
}
