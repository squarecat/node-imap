exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devServer: {
      inline: false
    }
  });
};
