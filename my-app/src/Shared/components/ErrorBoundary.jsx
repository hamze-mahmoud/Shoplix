import React from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
          <div className="text-center max-w-md space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-error" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-neutral-600">
                We're sorry, but something unexpected happened. Please try again.
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-600 font-mono break-words">
                {this.state.error?.toString()}
              </p>
            </div>

            <Button onClick={this.resetError} variant="primary">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
