import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Reusable Button Component
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: xs, sm, md, lg
 * States: loading, disabled
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconPosition = "left",
  ...props
}) {
  const baseClass =
    "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeClasses = {
    xs: "px-2 py-1 text-xs h-7",
    sm: "px-3 py-2 text-sm h-8",
    md: "px-4 py-2 text-base h-10",
    lg: "px-6 py-3 text-lg h-12",
  };

  const variantClasses = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-400 shadow-md hover:shadow-lg",
    secondary:
      "bg-accent-400 text-neutral-900 hover:bg-accent-500 active:bg-accent-600 focus:ring-accent-300 shadow-md hover:shadow-lg",
    outline:
      "border-2 border-primary-500 text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-300",
    ghost: "text-primary-700 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-300",
    danger:
      "bg-error text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-400 shadow-md hover:shadow-lg",
  };

  return (
    <button
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {Icon && iconPosition === "left" && !loading && <Icon className="w-4 h-4" />}
      {children}
      {Icon && iconPosition === "right" && !loading && <Icon className="w-4 h-4" />}
    </button>
  );
}
