import React, { Component } from 'react';

export default class PayButton extends Component {
  constructor() {
    super();
    this.state = {
      ready: null
    };
  }
  componentDidMount() {
    window.Paddle.Button.load();
    const { referrer } = window.document;
    this.setState({ referrer });
    window.onConversionFailed = this.onConversionFailed.bind(this);
    window.onConversionSuccess = this.onConversionSuccess.bind(this);
  }
  render() {
    const { children, productId, className } = this.props;
    const { referrer } = this.state;
    return (
      <button
        data-theme="none"
        data-product={productId}
        data-message={`Thanks for supporting UptimeBar! After the payment is processed you'll be redirected to the download page.`}
        data-passthrough={referrer || 'direct'}
        data-success-callback="onConversionSuccess"
        data-close-callback="onConversionFailed"
        className={`paddle_button ${className}`}
      >
        {children}
      </button>
    );
  }
  onConversionSuccess(data) {
    const { onSuccess } = this.props;
    if (onSuccess) {
      onSuccess({
        checkoutId: data.checkout.id,
        price: data.checkout.prices.customer.total
      });
    }
  }
  onConversionFailed() {
    const { onClose } = this.props;
    if (onClose) onClose();
  }
}
