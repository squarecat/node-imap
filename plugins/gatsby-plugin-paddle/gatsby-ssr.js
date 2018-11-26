"use strict";

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.onRenderBody = function (_ref, pluginOptions) {
  var setPostBodyComponents = _ref.setPostBodyComponents;

  return setPostBodyComponents([_react2.default.createElement("script", {
    key: "gatsby-plugin-braintree",
    src: "https://cdn.paddle.com/paddle/paddle.js"
  }), _react2.default.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: getPaddleCodeStr(pluginOptions)
    }
  })]);
};

function getPaddleCodeStr(options) {
  return "Paddle.Setup({\n    vendor: " + options.vendorId + ",\n    completeDetails: " + options.completeDetails + ",\n    debug: " + options.debug + "\n  })";
}