import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Reusable Input Component
 * Supports text, email, password, number, etc.
 * With optional icon, error state, and helper text
 */
export default function Input({
  label,
  error,
  hint,
  icon: Icon = null,
  type = "text",
  size = "md",
  className = "",
  disabled = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const baseClass =
    "w-full px-4 py-2 border border-neutral-300 rounded-lg bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent";

  const sizeClasses = {
    sm: "text-sm h-8",
    md: "text-base h-10",
    lg: "text-lg h-12",
  };

  const errorClass = error ? "border-error focus:ring-error/50" : "";
  const disabledClass = disabled ? "bg-neutral-100 cursor-not-allowed opacity-60" : "";

  const actualType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-semibold text-neutral-700">{label}</label>}

      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />}

        <input
          type={actualType}
          className={`${baseClass} ${sizeClasses[size]} ${errorClass} ${disabledClass} ${Icon ? "pl-10" : ""} ${className}`}
          disabled={disabled}
          {...props}
        />

        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-error font-medium">{error}</p>}
      {hint && !error && <p className="text-sm text-neutral-500">{hint}</p>}
    </div>
  );
}
