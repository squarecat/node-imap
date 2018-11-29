module.exports = {
  siteMetadata: {
    title: 'Leave Me Alone - Take back control of your inbox',
    description: `Leave Me Alone lets you see all of your subscription emails in one place and unsubscribe
    from them with a single click!`,
    baseUrl: 'https://leavemealone.xyz',
    twitterHandle: '@LeaveMeAloneApp',
    siteName: 'Leave Me Alone'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/assets`
      }
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: 'UA-129815670-1',
        head: false,
        anonymize: true,
        respectDNT: true
      }
    },
    {
      resolve: 'gatsby-plugin-paddle',
      options: {
        vendorId: 35012,
        productId: 545883,
        checkoutSecret: '1f1rd9u',
        debug: true,
        completeDetails: true
      }
    },
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: ['/app/*'] }
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
    }
  ]
};
