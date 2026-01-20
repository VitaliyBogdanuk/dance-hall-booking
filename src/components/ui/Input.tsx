import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 h-12 text-base bg-[#F9FAFB] rounded-control transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-surface ${
          error
            ? "ring-2 ring-red-500/30 focus:ring-red-500/30"
            : ""
        } ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${inputId}-helper`} className="mt-2 text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
