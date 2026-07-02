import React from "react";

/**
 * Spinner and Loading Components
 */
export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full border-3 border-neutral-200" />
        <div className="absolute inset-0 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
      </div>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center space-y-4">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-neutral-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-4 text-center">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
