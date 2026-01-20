import React from "react";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = false,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeStyles = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantStyles = {
    default: "bg-accent",
    success: "bg-accent",
    warning: "bg-orange-500",
    error: "bg-red-500",
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-text-primary">Progress</span>
          <span className="text-sm text-text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={`h-full rounded-full transition-all duration-200 ease-out ${variantStyles[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
