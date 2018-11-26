module.exports = {
  siteMetadata: {
    title: 'Leave Me Alone - take back control of your inbox',
    description: `Take back control of your inbox by telling subscription spammers to leave you alone!`,
    baseUrl: 'https://leavemealone.xyz',
    twitterHandle: '@LeaveMeAloneApp'
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
    }
  ]
};
