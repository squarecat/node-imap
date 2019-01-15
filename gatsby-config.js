module.exports = {
  siteMetadata: {
    title: 'Leave Me Alone - A Privacy Focused Email Unsubscription Service',
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
      resolve: `gatsby-plugin-google-gtag`,
      options: {
        trackingIds: ['UA-129815670-1'],
        gtagConfig: {
          anonymize_ip: true
        },
        pluginConfig: {
          head: false,
          respectDNT: true
        }
      }
    },
    // {
    //   resolve: `gatsby-plugin-create-client-paths`,
    //   options: { prefixes: ['/app/*'] }
    // },
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
    `gatsby-plugin-stripe-elements`
  ]
};
