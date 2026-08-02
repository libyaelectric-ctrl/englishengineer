import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (import.meta.env.DEV) {
      void error;
      void info;
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <main className="mx-auto mt-16 max-w-xl rounded-2xl border border-rose-200 bg-surface p-8 text-center shadow-sm">
          <h1 className="text-xl font-black text-foreground">Page Error</h1>
          <p className="mt-3 text-sm leading-6 text-muted-copy">
            {this.state.error?.message ?? 'Something went wrong on this page.'}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-5 inline-flex rounded-xl bg-sky-600 px-4 py-2 text-sm font-bold text-white cursor-pointer"
          >
            Try Again
          </button>
        </main>
      );
    }
    return this.props.children;
  }
}
