import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary 组件
 * 捕获子组件渲染错误，展示友好提示，单个图表崩溃不影响其他模块
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] 组件渲染错误:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
          padding: 24,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius)',
          gap: 12,
        }}>
          <span style={{ color: 'var(--color-critical)', fontSize: 'var(--font-size-normal)' }}>
            {this.props.fallbackTitle ?? '模块渲染异常'}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-small)' }}>
            {this.state.error?.message ?? '未知错误'}
          </span>
          <button
            onClick={this.handleRetry}
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              padding: '4px 16px',
              cursor: 'pointer',
              fontSize: 'var(--font-size-small)',
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
