import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-center text-red-600 sm:p-6">
          Something went wrong. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}
