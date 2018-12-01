import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    if (!window.location.host.startsWith('local')) {
      Sentry.withScope(scope => {
        Object.keys(errorInfo).forEach(key => {
          scope.setExtra(key, errorInfo[key]);
        });
        Sentry.captureException(error);
      });
    }
  }

  render() {
    const { error } = this.state;
    if (error) {
      // You can render any custom fallback UI
      return (
        <div className="mail-error">
          <p>Oh no, it looks like something went badly wrong...</p>
          <p>Please refresh the page and try what you were doing again.</p>
          <p>
            This is definitely our fault, so if it still doesn't work then
            please bear with us and we'll try and get it sorted for you!
          </p>
          <a onClick={() => Sentry.showReportDialog()}>Report feedback</a>
          <pre className="error-details">{error}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
