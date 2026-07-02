import React from "react";
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from "lucide-react";

/**
 * Reusable Alert Component
 * Variants: info, success, warning, error
 * Dismissible with close button
 */
export default function Alert({
  variant = "info",
  title,
  message,
  onClose,
  dismissible = true,
}) {
  const configs = {
    info: {
      icon: Info,
      bgColor: "bg-gray-100",
      borderColor: "border-gray-300",
      textColor: "text-gray-800",
      iconColor: "text-gray-500",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      iconColor: "text-yellow-600",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-500",
    },
  };

  const config = configs[variant];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />

      <div className="flex-1">
        {title && <h3 className="font-semibold mb-1">{title}</h3>}
        {message && <p className="text-sm">{message}</p>}
      </div>

      {dismissible && onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
