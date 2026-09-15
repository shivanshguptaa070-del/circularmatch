import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f4f7f5] p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#d2e5dd] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffeaee]">
              <AlertCircle className="text-[#e98467]" size={24} />
            </div>
            <h1 className="mb-2 text-xl font-semibold text-[#071f1b]">Something went wrong</h1>
            <p className="mb-6 text-sm text-[#748982]">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <pre className="mt-6 max-h-32 overflow-auto rounded-lg border border-[#d2e5dd] bg-[#f4f7f5] p-3 text-left text-xs text-[#748982]">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
