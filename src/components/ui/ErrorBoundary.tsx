import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    // Clear local storage and reload as a recovery mechanism
    try {
      window.localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear local storage:', e);
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-layout" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: 'var(--bg-app, #f4f7f6)',
          fontFamily: 'var(--font-sans, sans-serif)'
        }}>
          <Card variant="glow" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 30px' }}>
            <AlertTriangle size={48} color="var(--color-error, #ef4444)" style={{ marginBottom: '20px' }} />
            <h2 style={{ marginBottom: '12px' }}>Something went wrong</h2>
            <p style={{ marginBottom: '24px', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              An unexpected error occurred. This could be due to corrupted storage data. 
              Clicking the reset button will wipe your local logs and reload the app.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="primary" onClick={this.handleReset}>
                Reset Data & Reload
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
