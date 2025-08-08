'use client'

import React from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} retry={this.retry} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  retry?: () => void
}

function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">😵</span>
        </div>
        
        <h1 className="text-xl font-bold text-gray-900 mb-3">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Error Details:</h3>
            <p className="text-xs text-red-600 font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={retry}
            className="w-full px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🔄</span>
              <span>Try Again</span>
            </div>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🏠</span>
              <span>Go Home</span>
            </div>
          </button>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">
              Still having trouble? Contact our support team.
            </p>
            <div className="flex space-x-3 justify-center">
              <a
                href="https://wa.me/213XXXXXXXXX?text=I encountered an error on the app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-3 py-2 rounded-lg hover:bg-green-200 transition-colors"
              >
                <span>💬</span>
                <span>WhatsApp</span>
              </a>
              <a
                href="tel:+213XXXXXXXXX"
                className="inline-flex items-center space-x-1 text-xs bg-blue-100 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <span>📞</span>
                <span>Call</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specific error components for different scenarios
export function NetworkErrorFallback({ retry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">📶</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Connection Problem
      </h3>
      
      <p className="text-gray-600 mb-6 text-sm">
        Please check your internet connection and try again.
      </p>

      <button
        onClick={retry}
        className="px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">🔄</span>
          <span>Try Again</span>
        </div>
      </button>
    </div>
  )
}

export function LoadingErrorFallback({ retry }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Loading Failed
      </h3>
      
      <p className="text-gray-600 mb-6 text-sm">
        We couldn't load this content right now.
      </p>

      <div className="space-y-3 w-full max-w-xs">
        <button
          onClick={retry}
          className="w-full px-6 py-3 bg-livrili-prussian text-white rounded-xl hover:bg-livrili-prussian/90 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">🔄</span>
            <span>Try Again</span>
          </div>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 hover:scale-105 active:scale-95 font-medium"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">↻</span>
            <span>Refresh Page</span>
          </div>
        </button>
      </div>
    </div>
  )
}

// Hook for handling async errors in functional components
export function useAsyncError() {
  const [, setError] = React.useState()
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error
    })
  }, [])
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  FallbackComponent?: React.ComponentType<ErrorFallbackProps>
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary fallback={FallbackComponent}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}