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
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertCircle size={28} />
            </div>
            <h1 className="mb-2 text-[22px] font-bold text-slate-900 tracking-tight">Something went wrong</h1>
            <p className="mb-6 text-[14px] leading-relaxed text-slate-500">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary rounded-xl w-full justify-center text-[14px] font-semibold !py-3"
            >
              Refresh Page
            </button>
            {this.state.error && (
              <pre className="mt-6 max-h-32 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-[12px] text-slate-600 leading-relaxed">
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
