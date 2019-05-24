import '../common.scss';
import './layout.css';

import { StaticQuery, graphql } from 'gatsby';

import Helmet from 'react-helmet';
import React from 'react';
import { setConfig } from 'react-hot-loader';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;
const metaImgUrl = `${process.env.CDN_URL}/images/meta/meta-img.png`;
const logoSquareUrl = `${process.env.CDN_URL}/images/meta/logo-square.png`;

setConfig({ pureSFC: true });

const Layout = ({
  title: pageTitle,
  description: pageDescription,
  children
}) => (
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
        title,
        description,
        baseUrl,
        twitterHandle,
        siteName
      } = data.site.siteMetadata;
      const metaTitle = pageTitle ? `${pageTitle} - ${siteName}` : title;
      const metaDescription = pageDescription || description;
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
                name: 'twitter:card',
                content: 'summary_large_image'
              },
              {
                name: 'twitter:domain',
                value: baseUrl
              },
              {
                name: 'twitter:title',
                value: metaTitle
              },
              {
                name: 'twitter:description',
                value: description
              },
              {
                name: 'twitter:image',
                content: metaImgUrl
              },
              {
                name: 'twitter:url',
                value: baseUrl
              },
              {
                name: 'twitter:site',
                value: twitterHandle
              },
              {
                name: 'twitter:creator',
                value: '@SquarecatWebDev'
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
                content: baseUrl
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
                href: faviconUrl,
                id: 'dynamic-favicon'
              }
            ]}
          />
          {children}
        </>
      );
    }}
  />
);

export default Layout;
