module.exports = {
  siteMetadata: {
    title: 'Easily unsubscribe from spam emails - Leave Me Alone',
    description: `See all of your spam, newsletters, and subscription emails in one place and unsubscribe from them with a single click. Take back control of your Gmail and Outlook inbox.`,
    baseUrl: 'https://leavemealone.app',
    siteUrl: 'https://leavemealone.app',
    twitterHandle: '@LeaveMeAloneApp',
    siteName: 'Leave Me Alone'
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-webpack-bundle-analyzer',
      options: {
        analyzerPort: 8888,
        production: true
      }
    },
    'gatsby-plugin-react-helmet',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    // `gatsby-plugin-transition-link`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: [
          `/maintenance`,
          `/login/**/*`,
          `/goodbye`,
          `/app`,
          `/app/**/*`
        ]
      }
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
