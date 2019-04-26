module.exports = {
  siteMetadata: {
    title: 'Leave Me Alone - Take back control of your inbox',
    description: `See all of your subscription emails in one place and unsubscribe from them with a single click.`,
    baseUrl: 'https://leavemealone.xyz',
    siteUrl: 'https://leavemealone.xyz',
    twitterHandle: '@LeaveMeAloneApp',
    siteName: 'Leave Me Alone'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-transition-link`,
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        exclude: [
          `/maintenance`,
          `/goodbye`,
          `/wall-of-love`,
          `/header`,
          `/gifts/gift-checkout`,
          `/gifts/gifts-prices`,
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
    },
    {
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ['UA-129815670-1'],
        gtagConfig: {
          anonymize_ip: true
        },
        pluginConfig: {
          head: false,
          respectDNT: true,
          exclude: ['/login/*/redirect']
        }
      }
    },
    {
      resolve: `gatsby-plugin-countly`,
      options: {
        respectDNT: false,
        app_key: '5db45d43896e6ab2da8e5f50f39dd9a07b35e953',
        url: 'https://analytics.squarecat.io',
        script_url: 'https://analytics.squarecat.io/sdk/web/countly.min.js',
        track_sessions: true,
        exclude: ['/app', '/app/*']
      }
    },
    'gatsby-plugin-twitter',
    {
      resolve: `gatsby-plugin-stripe`,
      options: {
        async: true
      }
    }
  ]
};
