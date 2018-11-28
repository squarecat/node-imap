'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PayButton = function (_Component) {
  _inherits(PayButton, _Component);

  function PayButton() {
    _classCallCheck(this, PayButton);

    var _this = _possibleConstructorReturn(this, (PayButton.__proto__ || Object.getPrototypeOf(PayButton)).call(this));

    _this.state = {
      ready: null
    };
    return _this;
  }

  _createClass(PayButton, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      window.Paddle.Button.load();
      var referrer = window.document.referrer;

      this.setState({ referrer: referrer });
      window.onConversionFailed = this.onConversionFailed.bind(this);
      window.onConversionSuccess = this.onConversionSuccess.bind(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          children = _props.children,
          productId = _props.productId,
          className = _props.className,
          message = _props.message;
      var referrer = this.state.referrer;

      return _react2.default.createElement(
        'button',
        {
          'data-theme': 'none',
          'data-product': productId,
          'data-message': message,
          'data-passthrough': referrer || 'direct',
          'data-success-callback': 'onConversionSuccess',
          'data-close-callback': 'onConversionFailed',
          className: 'paddle_button ' + className
        },
        children
      );
    }
  }, {
    key: 'onConversionSuccess',
    value: function onConversionSuccess(data) {
      var onSuccess = this.props.onSuccess;

      if (onSuccess) {
        onSuccess({
          checkoutId: data.checkout.id,
          price: data.checkout.prices.customer.total
        });
      }
    }
  }, {
    key: 'onConversionFailed',
    value: function onConversionFailed() {
      var onClose = this.props.onClose;

      if (onClose) onClose();
    }
  }]);

  return PayButton;
}(_react.Component);

exports.default = PayButton;