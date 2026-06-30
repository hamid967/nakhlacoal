import React from 'react';

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
};

type State = { hasError: boolean };

/**
 * Catches WebGL / canvas rendering errors (context loss, shader compile
 * failures, R3F crashes) so a broken GPU surface never takes down the page.
 * Renders an optional static fallback (or nothing) instead.
 */
export class WebGLBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (import.meta.env.DEV) {
       
      console.warn('[WebGLBoundary] suppressed render error:', error);
    }
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

export default WebGLBoundary;
