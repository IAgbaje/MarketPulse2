import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: Readonly<ErrorBoundaryProps>;
  state: ErrorBoundaryState = {
    hasError: false,
    message: '',
  };

  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    console.error('MarketPulse UI error:', error, info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-black/[0.08] p-7 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#00567c]/10 text-[#00567c] mx-auto flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">refresh</span>
            </div>
            <div className="space-y-1.5">
              <h1 className="font-display text-xl font-bold text-[#1d1d1f]">
                MarketPulse hit a snag
              </h1>
              <p className="text-sm text-[#6e6e73] leading-relaxed">
                Something interrupted the page from loading. Reload to get back to your market
                prices and budget.
              </p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#00567c] hover:bg-[#004361] text-white text-sm font-semibold transition-colors"
            >
              Reload MarketPulse
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
