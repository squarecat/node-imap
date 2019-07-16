import '../common.scss';
import './layout.css';

import { StaticQuery, graphql } from 'gatsby';

import Helmet from 'react-helmet';
import React from 'react';
import { setConfig } from 'react-hot-loader';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;
const metaImgUrl = `${process.env.CDN_URL}/images/meta/meta-img-v2.png`;
const logoSquareUrl = `${process.env.CDN_URL}/images/meta/logo.png`;

setConfig({ pureSFC: true });

const Layout = ({
  title: pageTitle,
  description: pageDescription,
  slug: pageSlug,
  children
}) => {
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
              description
              baseUrl
              twitterHandle
              siteName
            }
          }
        }
      `}
      render={data => {
        const {
          title: baseTitle,
          description: baseDescription,
          baseUrl,
          twitterHandle,
          siteName
        } = data.site.siteMetadata;

        const metaTitle = pageTitle ? `${pageTitle} - ${siteName}` : baseTitle;
        const metaDescription = pageDescription || baseDescription;
        const metaFullUrl = pageSlug ? `${baseUrl}${pageSlug}` : baseUrl;

        return (
          <>
            <Helmet
              title={metaTitle}
              lang="en"
              meta={[
                {
                  name: 'charSet',
                  content: 'utf-8'
                },
                {
                  name: 'viewport',
                  content: 'width=device-width, initial-scale=1.0'
                },
                {
                  name: 'description',
                  content: metaDescription
                },
                {
                  name: 'url',
                  content: baseUrl
                },
                {
                  name: 'twitter:card',
                  content: 'summary_large_image'
                },
                {
                  name: 'twitter:title',
                  value: metaTitle
                },
                {
                  name: 'twitter:description',
                  value: metaDescription
                },
                {
                  name: 'twitter:image',
                  content: metaImgUrl
                },
                {
                  name: 'twitter:image:alt',
                  content: `Stylized image of Leave Me Alone listing subscription emails with buttons to unsubscribe`
                },
                {
                  name: 'twitter:url',
                  value: metaFullUrl
                },
                {
                  name: 'twitter:site',
                  value: twitterHandle
                },
                {
                  name: 'twitter:creator',
                  value: twitterHandle
                },
                {
                  name: 'X-UA-Compatible',
                  content: 'IE=edge,chrome=1'
                },
                {
                  name: 'og:locale',
                  content: 'en_US'
                },
                {
                  name: 'og:image',
                  content: metaImgUrl
                },
                {
                  name: 'og:image:secure_url',
                  content: metaImgUrl
                },
                {
                  name: 'og:image:width',
                  content: '2400'
                },
                {
                  name: 'og:image:height',
                  content: '1200'
                },
                {
                  name: 'og:type',
                  content: 'website'
                },
                {
                  name: 'og:url',
                  content: metaFullUrl
                },
                {
                  name: 'og:title',
                  content: metaTitle
                },
                {
                  name: 'og:description',
                  content: metaDescription
                },
                {
                  name: 'og:site_name',
                  content: siteName
                },
                {
                  name: 'og:logo',
                  content: logoSquareUrl
                }
              ]}
              link={[
                { rel: 'canonical', href: baseUrl },
                {
                  rel: 'shortcut icon',
                  type: 'image/png',
                  href: faviconUrl
                }
              ]}
            />
            {children}
          </>
        );
      }}
    />
  );
};

export default Layout;
