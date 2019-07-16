const path = require('path');

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devServer: {
      inline: false
    }
  });
};

exports.createPages = ({ graphql, actions }) => {
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
    })
    .catch(e => console.error(e));
};
