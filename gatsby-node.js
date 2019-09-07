const path = require('path');

exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  let config = {
    ...getConfig(),
    devServer: {
      inline: false
    }
  };
  if (stage === 'build-javascript') {
    config = {
      ...config,
      optimization: {
        ...config.optimization,
        runtimeChunk: {
          name: `webpack-runtime`
        },
        splitChunks: {
          name: false,
          chunks: `all`,
          cacheGroups: {
            ...config.optimization.splitChunks.cacheGroups,
            commonAppPages: {
              name: `app-pages`,
              chunks: `all`,
              test: /[\\/]src[\\/]pages[\\/]app[\\/].*/,
              priority: 0
            },
            dexie: {
              name: `commons-app`,
              chunks: `all`,
              test: /[\\/]node_modules[\\/](dexie|socket.io-parser|socket.io-client)[\\/]/,
              priority: -5
            },
            commons: {
              name: `commons`,
              chunks: `all`,
              minChunks: 5,
              priority: -10
            }
          }
        }
      }
    };
  }
  console.log(JSON.stringify(config.optimization, null, 2));
  actions.replaceWebpackConfig(config);
};

exports.createPages = ({ graphql, actions }) => {
  if (process.env.SKIP_PAGES) {
    return Promise.resolve();
  }
  const { createPage } = actions;
  return graphql(`
    {
      allSendersJson {
        edges {
          node {
            id
            slug
          }
        }
      }
      allLongTailJson {
        edges {
          node {
            id
            slug
          }
        }
      }
    }
  `)
    .then(result => {
      let pages = [];
      console.log('Creating occurrence pages...');
      result.data.allSendersJson.edges.forEach(({ node }) => {
        const { id, slug } = node;
        createPage({
          path: slug,
          component: path.resolve(`./src/templates/senders.js`),
          context: {
            id
          }
        });
        pages = [...pages, slug];
      });
      // console.log('Creating keyword pages...');
      // result.data.allLongTailJson.edges.forEach(({ node }) => {
      //   const { id, slug } = node;
      //   createPage({
      //     path: slug,
      //     component: path.resolve(`./src/templates/long-tail-keyword.js`),
      //     context: {
      //       id
      //     }
      //   });
      //   pages = [...pages, slug];
      // });
      console.log(pages.join('\n'));
      return true;
    })
    .catch(e => console.error(e));
};
