import React from "react";

/**
 * Reusable Card Component
 * Flexible container with optional header, footer, and hover effects
 */
export default function Card({
  children,
  header,
  footer,
  className = "",
  hoverable = false,
  glass = false,
  ...props
}) {
  const baseClass = "rounded-xl bg-white overflow-hidden transition-all duration-300";

  const shadowClass = hoverable
    ? "shadow-md hover:shadow-lg hover:scale-105"
    : "shadow-sm";

  const glassClass = glass
    ? "bg-white/80 backdrop-blur-md border border-white/20"
    : "";

  return (
    <div
      className={`${baseClass} ${shadowClass} ${glassClass} ${className}`}
      {...props}
    >
      {header && <div className="px-6 py-4 border-b border-neutral-200">{header}</div>}

      <div className="p-6">{children}</div>

      {footer && <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">{footer}</div>}
    </div>
  );
}
