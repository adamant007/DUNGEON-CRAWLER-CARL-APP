import React from 'react';

export class ErrorBoundary extends React.Component<React.PropsWithChildren, { error: string }> {
  state = { error: '' };

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  render() {
    return this.state.error ? (
      <div style={{ padding: 24, fontFamily: 'system-ui' }}>
        <h1>Crawler Companion</h1>
        <p>Something went wrong.</p>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error}</pre>
        <button onClick={() => location.reload()}>Reload app</button>
      </div>
    ) : this.props.children;
  }
}
