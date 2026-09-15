import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Recovered from component render error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/citizen';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-xl text-center space-y-5">
            <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/60 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Page Recovered</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A component transition warning occurred. Click below to continue without losing your session.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 btn-primary text-xs py-3 justify-center font-bold"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload View</span>
              </button>
              <button
                onClick={this.handleHome}
                className="flex-1 btn-indigo text-xs py-3 justify-center font-bold"
              >
                <Home className="w-4 h-4" />
                <span>Go to Portal</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
