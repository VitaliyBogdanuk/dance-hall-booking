import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  size = "md",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-control";

  const variantStyles = {
    default: "bg-accent-soft text-accent",
    success: "bg-accent-soft text-accent",
    warning: "bg-orange-50 text-orange-600",
    error: "bg-red-50 text-red-600",
    info: "bg-blue-50 text-blue-600",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs h-5",
    md: "px-2.5 py-1 text-sm h-6",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
