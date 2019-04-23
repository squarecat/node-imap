import '../common.scss';
import './layout.css';

import { StaticQuery, graphql } from 'gatsby';

import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import React from 'react';
import { setConfig } from 'react-hot-loader';

const faviconUrl = `${process.env.CDN_URL}/images/meta/favicon.png`;
const metaImgUrl = `${process.env.CDN_URL}/images/meta/meta-img.png`;
const logoSquareUrl = `${process.env.CDN_URL}/images/meta/logo-square.png`;

setConfig({ pureSFC: true });

const Layout = ({ page, children }) => (
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
      const pageTitle = page ? `${page} | ${siteName}` : title;
      return (
        <>
          <Helmet>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>{pageTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={baseUrl} />
            <link
              rel="shortcut icon"
              type="image/png"
              href={faviconUrl}
              id="dynamic-favicon"
            />

            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={metaImgUrl} />
            <meta property="og:image:secure_url" content={metaImgUrl} />
            <meta property="og:image:width" content="2400" />
            <meta property="og:image:height" content="1200" />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={baseUrl} />
            <meta property="og:title" content={pageTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:logo" content={logoSquareUrl} />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:domain" value={baseUrl} />
            <meta name="twitter:title" value={pageTitle} />
            <meta name="twitter:description" value={description} />
            <meta name="twitter:image" content={metaImgUrl} />
            <meta name="twitter:url" value={baseUrl} />
            <meta name="twitter:site" value={twitterHandle} />
            <meta name="twitter:creator" value="@dinkydani21" />
            <html lang="en" />
          </Helmet>
          {children}
        </>
      );
    }}
  />
);

Layout.propTypes = {
  children: PropTypes.node.isRequired
};

export default Layout;
