const sitemapOptions = require('./sitemap.js');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV}`
});

console.log('sa: ', process.env.SIMPLE_ANALYTICS_DOMAIN);
let plugins = [];
if (process.env.ANALYZE) {
  plugins = [
    ...plugins,
    {
      resolve: `gatsby-plugin-webpack-bundle-analyzer`,
      options: {
        production: true
      }
    }
  ];
}
module.exports = {
  siteMetadata: {
    title: 'Easily unsubscribe from unwanted emails - Leave Me Alone',
    description: `See all of your subscription emails, newsletters, and spam in one place and unsubscribe from them with a single click. Take back control of your inbox.`,
    baseUrl: 'https://leavemealone.app',
    siteUrl: 'https://leavemealone.app',
    twitterHandle: '@LeaveMeAloneApp',
    siteName: 'Leave Me Alone'
  },
  plugins: [
    ...plugins,
    `gatsby-transformer-json`,
    'gatsby-plugin-react-helmet',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-sass`,
    {
      resolve: 'simple-analytics-gatsby-plugin',
      options: {
        domain: process.env.SIMPLE_ANALYTICS_DOMAIN,
        scriptName: process.env.SIMPLE_ANALYTICS_SCRIPT,
        metomic: 'analytics',
        trackEvents: true,
        trackPageViews: true
      }
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: sitemapOptions
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `tweetImages`,
        path: `${__dirname}/src/assets/tweets/`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets`
      }
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `senders`,
        path: `${__dirname}/src/senders/`
      }
    },
    {
      resolve: `gatsby-source-airtable`,
      options: {
        apiKey: process.env.AIRTABLE_API_KEY,
        tables: [
          {
            baseId: `appmarx5L9y9Lb2o0`,
            tableName: `News`,
            tableView: 'Shown',
            mapping: { Cover_Image: `fileNode`, Logo: `fileNode` }
          }
        ]
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-react-css-modules`,
      options: {
        // *.css files are included by default.
        // To support another syntax (e.g. SCSS),
        // add `postcss-scss` to your project's devDependencies
        // and add the following option here:
        filetypes: {
          '.scss': { syntax: `postcss-scss` }
        },

        // Exclude global styles from the plugin using a RegExp:
        exclude: `\/global\/`
        // For all the options check babel-plugin-react-css-modules README link provided above
      }
    }
  ]
};
