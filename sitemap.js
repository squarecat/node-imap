const options = {
  exclude: [`/maintenance`, `/login/**/*`, `/goodbye`, `/app`, `/app/**/*`],
  query: `
  {
    site {
      siteMetadata {
        siteUrl
      }
    }
    allSitePage {
      edges {
        node {
          path
        }
      }
    }
}`,
  serialize: ({ site, allSitePage }) =>
    allSitePage.edges
      .filter(({ node }) => {
        if (node.path.includes('404')) {
          return false;
        }
        if (node.path.startsWith('/app')) {
          return false;
        }
        return true;
      })
      .map(({ node }) => {
        const { path } = node;
        let freq = 'yearly';
        let priority = 0.8;
        if (path === '/') {
          priority = 1;
        }
        if (path.startsWith('/how-to')) {
          priority = 0.7;
          freq = 'monthly';
        }
        if (path === '/terms/' || path === '/privacy/') {
          priority = 0.6;
        }
        return {
          url: site.siteMetadata.siteUrl + path,
          changefreq: freq,
          priority
        };
      })
};

module.exports = options;
