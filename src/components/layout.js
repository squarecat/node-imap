import { setConfig } from 'react-hot-loader';

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { StaticQuery, graphql } from 'gatsby';

import favicon from '../assets/meta/favicon.png';
import metaImage from '../assets/meta/meta-img.png';

import './layout.css';

setConfig({ pureSFC: true });

const Layout = ({ children }) => (
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
      return (
        <>
          <Helmet title={title}>
            <meta charSet="utf-8" />
            <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={`${baseUrl}/index.html`} />
            <link rel="shortcut icon" type="image/png" href={favicon} />
            {/* facebook open graph tags */}
            <meta property="og:locale" content="en_US" />
            <meta property="og:image" content={`${baseUrl}${metaImage}`} />
            <meta
              property="og:image:secure_url"
              content={`${baseUrl}${metaImage}`}
            />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={baseUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:site_name" content={siteName} />

            {/* twitter card tags additive with the og: tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:domain" value={baseUrl} />
            <meta name="twitter:title" value={title} />
            <meta name="twitter:description" value={description} />
            <meta name="twitter:image" content={`${baseUrl}${metaImage}`} />
            <meta name="twitter:url" value={baseUrl} />
            <meta name="twitter:site" value={twitterHandle} />
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
