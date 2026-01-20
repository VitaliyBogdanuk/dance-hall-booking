import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({ label, error, helperText, options, className = "", id, ...props }: SelectProps) {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-4 h-12 text-base bg-[#F9FAFB] rounded-control transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-surface appearance-none bg-[url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e')] bg-[length:1.5em_1.5em] bg-[right_0.75rem_center] bg-no-repeat ${
          error
            ? "ring-2 ring-red-500/30 focus:ring-red-500/30"
            : ""
        } ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${selectId}-helper`} className="mt-2 text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  );
}
