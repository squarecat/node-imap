module.exports = {
  siteMetadata: {
    title: 'Gatsby Default Starter'
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '/',
        background_color: '#663399',
        theme_color: '#663399',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png' // This path is relative to the root of the site.
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
