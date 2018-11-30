import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {}

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      // You can render any custom fallback UI
      return (
        <div className="mail-error">
          <p>Oh no, it looks like something went badly wrong...</p>
          <p>Please refresh the page and try what you were doing again.</p>
          <p>
            This is definitely our fault, so if it still doesn't work then
            please bear with us and we'll try and get it sorted for you!
          </p>
          <pre className="error-details">{error}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
