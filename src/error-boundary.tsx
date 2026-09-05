import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.log('[v0] ErrorBoundary caught:', error.message);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="crash">
          <h1>Something went wrong</h1>
          <p>{this.state.error.message}</p>
          <button onClick={() => this.setState({ error: null })}>Try again</button>
          <button onClick={() => location.reload()}>Reload app</button>
        </div>
      );
    }
    return this.props.children;
  }
}
