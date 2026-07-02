import React from "react";

/**
 * Reusable Badge Component
 * Variants: primary, success, warning, error, info, outline
 * Sizes: xs, sm, md
 */
export default function Badge({
  children,
  variant = "primary",
  size = "sm",
  icon: Icon = null,
  className = "",
  ...props
}) {
  const baseClass = "font-semibold rounded-full inline-flex items-center gap-1 whitespace-nowrap";

  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
  };

  const variantClasses = {
    primary: "bg-primary-100 text-primary-700",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    error: "bg-error/20 text-error",
    info: "bg-accent-100 text-accent-700",
    outline: "border border-primary-300 text-primary-700 bg-transparent",
  };

  return (
    <span
      className={`${baseClass} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}
