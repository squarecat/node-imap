import React from 'react';

exports.onRenderBody = ({ setPostBodyComponents }, pluginOptions) => {
  return setPostBodyComponents([
    <script
      key="gatsby-plugin-braintree"
      src="https://cdn.paddle.com/paddle/paddle.js"
    />,
    <script
      dangerouslySetInnerHTML={{
        __html: getPaddleCodeStr(pluginOptions)
      }}
    />
  ]);
};

function getPaddleCodeStr(options) {
  return `Paddle.Setup({
    vendor: ${options.vendorId},
    completeDetails: ${options.completeDetails},
    debug: ${options.debug}
  })`;
}
