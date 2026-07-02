import React, { useEffect } from "react";
import { X } from "lucide-react";
import Button from "./Button";

/**
 * Reusable Modal Component
 * With backdrop, close button, and action buttons
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => closeOnBackdropClick && onClose()}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full ${sizeClasses[size]} bg-white rounded-2xl shadow-xl animate-scale-in`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-neutral-100 rounded-lg transition"
            >
              <X className="w-6 h-6 text-neutral-500" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">{children}</div>

        {/* Footer */}
        {footer && <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200">{footer}</div>}
      </div>
    </div>
  );
}
