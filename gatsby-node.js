exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    devServer: {
      hot: false,
      inline: false
    }
  });
};
