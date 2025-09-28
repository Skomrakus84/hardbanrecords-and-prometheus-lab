import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  override componentDidCatch(_error: Error, _info: any) {
    // Możesz logować błędy do zewnętrznego serwisu
    // console.error(_error, _info);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#e53935', color: 'white', padding: 24, borderRadius: 8 }}>
          <h3>Wystąpił nieoczekiwany błąd.</h3>
          <pre style={{ fontSize: 13, color: '#fff' }}>{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
