module.exports = {
  siteMetadata: {
    title: 'Leave Me Alone - take back control of your inbox',
    description: `Take back control of your inbox by telling subscription spammers to leave you alone!`,
    baseUrl: 'https://leavemealone.xyz',
    twitterHandle: '@LeaveMeAloneApp'
  },
  plugins: [
    'gatsby-plugin-page-transitions',
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
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
    }
  ]
};
