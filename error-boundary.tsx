import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return <div style={{maxWidth:720,margin:'40px auto',padding:24,fontFamily:'system-ui',color:'#f5f0df',background:'#141519',border:'1px solid #5a492b',borderRadius:16}}>
      <h1>🐱 Crawler Companion</h1><h2>Something went wrong</h2>
      <p>The app loaded, but a browser error stopped the screen from rendering.</p>
      <pre style={{whiteSpace:'pre-wrap',background:'#090a0c',padding:12,borderRadius:10,overflow:'auto'}}>{this.state.error.message}</pre>
      <button onClick={()=>{localStorage.removeItem('crawler-character');location.reload();}}>Reset saved character & reload</button>
    </div>;
  }
}
