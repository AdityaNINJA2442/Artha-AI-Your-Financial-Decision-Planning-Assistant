import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, LogOut } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: any;
  errorInfo: ErrorInfo | null;
}

export function formatErrorMessage(err: any): string {
  if (!err) return 'An unexpected rendering error occurred.';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;

  if (Array.isArray(err)) {
    return err.map(item => formatErrorMessage(item)).join('; ');
  }

  if (typeof err === 'object') {
    if (typeof err.msg === 'string') return err.msg;
    if (typeof err.message === 'string') return err.message;
    if (typeof err.detail === 'string') return err.detail;
    if (Array.isArray(err.detail)) return formatErrorMessage(err.detail);
    try {
      return JSON.stringify(err);
    } catch {
      return 'Complex object error';
    }
  }

  return String(err);
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: any): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error('Artha AI React Uncaught Rendering Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleLogout = () => {
    localStorage.removeItem('artha_token');
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      const displayMsg = formatErrorMessage(this.state.error);

      return (
        <div style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 24px',
          background: 'var(--bg-dark)',
          color: 'var(--text-main)',
          textAlign: 'center'
        }}>
          <div className="fintech-card-elevated" style={{ maxWidth: '520px', width: '100%', padding: '36px', border: '1px solid var(--border-red)' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'var(--accent-red-subtle)', borderRadius: '50%', marginBottom: '16px' }}>
              <ShieldAlert size={32} color="#F28B8B" />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-cream)', marginBottom: '10px' }}>
              Artha AI couldn't load this page
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
              An uncaught rendering condition occurred. Your data in PostgreSQL remains completely safe.
            </p>

            <div style={{
              background: '#151515',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '0.8rem',
              color: '#F28B8B',
              textAlign: 'left',
              fontFamily: 'monospace',
              marginBottom: '20px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              Error: {displayMsg}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={this.handleReset} className="btn-gold" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
                <RefreshCw size={14} /> Retry Page
              </button>
              <button onClick={this.handleLogout} className="btn-secondary" style={{ fontSize: '0.85rem', padding: '10px 18px' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
